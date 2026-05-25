import type { Request, Response } from "express";

import { randomUUID } from "node:crypto";

import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import createAdultingMcpServer from "./create-mcp-server";

const DEFAULT_PORT = 3003;
const DEFAULT_HOST = "0.0.0.0";

const port = Number(process.env.MCP_PORT ?? DEFAULT_PORT);
const host = process.env.MCP_HOST ?? DEFAULT_HOST;

const internalToken = process.env.MCP_INTERNAL_TOKEN;

const transports = new Map<string, StreamableHTTPServerTransport>();

const app = createMcpExpressApp({
  host,
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    service: "adulting-learning-mcp",
    transport: "streamable-http",
    mcpEndpoint: "/mcp",
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    service: "adulting-learning-mcp",
    status: "running",
    endpoints: {
      health: "/health",
      mcp: "/mcp",
    },
    tools: [
      "generate_quiz_from_lesson_blocks",
      "get_lesson_context",
      "calculate_block_priorities",
      "get_current_course",
      "get_current_course_quiz_result",
      "get_current_course_learning_context",
      "get_course_quiz_result_by_course_id",
    ],
  });
});

app.all("/mcp", async (req: Request, res: Response) => {
  if (!isAuthorizedMcpRequest(req)) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Unauthorized MCP request.",
      },
      id: null,
    });

    return;
  }

  try {
    const sessionId = req.header("mcp-session-id");

    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.has(sessionId)) {
      transport = transports.get(sessionId)!;
    } else {
      const context = {
        userId: req.header("x-user-id") ?? undefined,
        courseId: req.header("x-course-id") ?? undefined,
      };

      const server = createAdultingMcpServer(undefined, context);

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),

        enableJsonResponse: true,

        onsessioninitialized: (newSessionId) => {
          transports.set(newSessionId, transport);

          console.log(`[MCP] Session initialized: ${newSessionId}`);
          console.log("[MCP] Context:", {
            hasUserId: Boolean(context.userId),
            courseId: context.courseId,
          });
        },
      });

      transport.onclose = () => {
        const closedSessionId = transport.sessionId;

        if (closedSessionId) {
          transports.delete(closedSessionId);
          console.log(`[MCP] Session closed: ${closedSessionId}`);
        }

        server.close();
      };

      await server.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("[MCP] Error handling request:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message:
            error instanceof Error
              ? error.message
              : "Internal MCP server error.",
        },
        id: null,
      });
    }
  }
});

const httpServer = app.listen(port, host, () => {
  console.log(
    [
      `[MCP] Adulting MCP server running`,
      `URL: http://${host}:${port}/mcp`,
      `Health: http://${host}:${port}/health`,
      `Lesson provider: ${process.env.LEARNING_LESSON_PROVIDER ?? "mock"}`,
      internalToken
        ? "Auth: MCP_INTERNAL_TOKEN enabled"
        : "Auth: MCP_INTERNAL_TOKEN not set, local dev mode",
    ].join("\n"),
  );
});

httpServer.on("error", (error) => {
  console.error("[MCP] Failed to start server:", error);
  process.exit(1);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("[MCP] Shutting down...");

  for (const transport of transports.values()) {
    transport.close();
  }

  transports.clear();

  httpServer.close((error) => {
    if (error) {
      console.error("[MCP] Error during shutdown:", error);
      process.exit(1);
    }

    console.log("[MCP] Server stopped.");
    process.exit(0);
  });
}

function isAuthorizedMcpRequest(req: Request): boolean {
  if (!internalToken) {
    return true;
  }

  const authorizationHeader = req.header("authorization");
  const bearerToken = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : undefined;

  const headerToken = req.header("x-mcp-token");

  return bearerToken === internalToken || headerToken === internalToken;
}