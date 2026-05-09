import type { Request, Response } from "express";

import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createAdultingMcpServer } from "./create-mcp-server";

/**
 * Adulting MCP HTTP server.
 *
 * Den här filen startar MCP-servern över Streamable HTTP.
 *
 * Lokal default:
 *
 * http://localhost:3003/mcp
 *
 * Tanken är att denna process ska kunna köras separat från vanliga backend:
 *
 * - backend API: 3001
 * - socket server: 3002
 * - MCP server: 3003
 *
 * För tävlingen är detta snyggt eftersom ni kan visa:
 *
 * 1. egen MCP-service
 * 2. MCP Inspector
 * 3. tools/list
 * 4. generate_quiz_from_lesson_blocks
 *
 * TODO när ni deployar:
 * - Sätt MCP_INTERNAL_TOKEN i production/staging.
 * - Lägg MCP-servern bakom intern ingress eller skyddad route.
 * - Om MCP-servern ska exponeras externt krävs starkare auth än enkel bearer-token.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Sätt LEARNING_LESSON_PROVIDER=database
 * - Då hämtar MCP-tools riktiga lesson blocks i stället för mockdata.
 */

const DEFAULT_PORT = 3003;
const DEFAULT_HOST = "0.0.0.0";

const port = Number(process.env.MCP_PORT ?? DEFAULT_PORT);
const host = process.env.MCP_HOST ?? DEFAULT_HOST;

/**
 * Om MCP_INTERNAL_TOKEN är satt kräver vi token för /mcp.
 *
 * Lokal utveckling:
 * - Om MCP_INTERNAL_TOKEN saknas släpper vi igenom requests.
 *
 * Production/staging:
 * - Sätt MCP_INTERNAL_TOKEN.
 *
 * Klient kan skicka token på två sätt:
 *
 * Authorization: Bearer <token>
 *
 * eller:
 *
 * x-mcp-token: <token>
 */
const internalToken = process.env.MCP_INTERNAL_TOKEN;

/**
 * createMcpExpressApp ger en Express-app anpassad för MCP.
 *
 * SDK-dokumentationen rekommenderar createMcpExpressApp för localhost-servrar
 * eftersom den kan ge DNS rebinding/host-header-skydd i defaultlägen.
 *
 * Här binder vi senare på 0.0.0.0 för Docker, så se TODO ovan kring auth/ingress.
 */
const app = createMcpExpressApp({
  /**
   * För Docker behöver vi ofta binda till 0.0.0.0.
   *
   * Om ni kör helt lokalt utan Docker kan ni sätta:
   *
   * MCP_HOST=127.0.0.1
   */
  host,
});

/**
 * Enkel health endpoint för Docker/Kubernetes.
 *
 * Den här är inte en MCP endpoint.
 * Den är bara till för health checks och snabb felsökning.
 */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    service: "adulting-learning-mcp",
    transport: "streamable-http",
    mcpEndpoint: "/mcp",
  });
});

/**
 * Extra liten info-endpoint.
 *
 * Bra när man öppnar http://localhost:3003 i browsern och vill se att
 * MCP-processen lever.
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    service: "adulting-learning-mcp",
    status: "running",
    endpoints: {
      health: "/health",
      mcp: "/mcp",
    },
    mockLessonIds: ["lesson_bolan_001", "lesson_hyreskontrakt_001"],
    tools: [
      "generate_quiz_from_lesson_blocks",
      "get_lesson_context",
      "calculate_block_priorities",
    ],
  });
});

/**
 * MCP endpoint.
 *
 * Vi kör stateless Streamable HTTP i MVP.
 *
 * Det betyder:
 * - En ny MCP-server skapas per request.
 * - Ingen session sparas mellan requests.
 * - Enklare att förstå, drifta och felsöka.
 *
 * Det räcker för:
 * - tools/list
 * - tools/call
 * - MCP Inspector-demo
 *
 * TODO senare:
 * Om ni vill ha resumability, server notifications eller mer avancerade
 * agent-sessioner kan ni gå över till stateful sessioner med sessionIdGenerator.
 */
app.post("/mcp", async (req: Request, res: Response) => {
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

  const server = createAdultingMcpServer();

  try {
    const transport = new StreamableHTTPServerTransport({
      /**
       * Stateless mode.
       *
       * För MVP är detta enklast.
       *
       * TODO senare:
       * Byt till:
       *
       * sessionIdGenerator: () => randomUUID()
       *
       * om ni vill ha stateful MCP-sessioner.
       */
      sessionIdGenerator: undefined,

      /**
       * JSON response mode passar bra för enkel tool-calling och MCP Inspector.
       *
       * Om ni senare behöver SSE/server notifications kan denna tas bort
       * eller sättas till false beroende på SDK-version.
       */
      enableJsonResponse: true,
    });

    await server.connect(transport);

    /**
     * createMcpExpressApp brukar hantera JSON body parsing.
     * req.body skickas vidare till MCP-transporten enligt SDK-exempel.
     */
    await transport.handleRequest(req, res, req.body);

    res.on("close", async () => {
      try {
        await transport.close();
      } catch (error) {
        console.error("[MCP] Failed to close transport:", error);
      }

      try {
        await server.close();
      } catch (error) {
        console.error("[MCP] Failed to close server:", error);
      }
    });
  } catch (error) {
    console.error("[MCP] Error handling request:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal MCP server error.",
        },
        id: null,
      });
    }
  }
});

/**
 * Streamable HTTP kan stödja GET/SSE i mer avancerade lägen.
 *
 * I vår MVP kör vi stateless JSON-response mode och tillåter bara POST.
 *
 * Detta gör beteendet tydligt och matchar vår första demo:
 *
 * MCP Inspector / client -> POST /mcp
 */
app.get("/mcp", (_req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message:
        "Method not allowed. This MVP MCP server accepts POST /mcp only.",
    },
    id: null,
  });
});

app.delete("/mcp", (_req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message:
        "Method not allowed. This MVP MCP server accepts POST /mcp only.",
    },
    id: null,
  });
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
  /**
   * Om ingen token är satt kör vi i dev-mode.
   */
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