import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenRouterMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
};

type CallOpenRouterWithMcpToolsInput = {
  history: ChatHistoryMessage[];
  systemPrompt: string;
  userId: string;
  courseId?: string;
  openRouterApiKey: string;
  openRouterModel: string;
};

const MCP_SERVER_URL = process.env.MCP_SERVER_URL ?? "http://mcp:3003/mcp";
const MCP_INTERNAL_TOKEN = process.env.MCP_INTERNAL_TOKEN;

export async function callOpenRouterWithMcpTools({
  history,
  systemPrompt,
  userId,
  courseId,
  openRouterApiKey,
  openRouterModel,
}: CallOpenRouterWithMcpToolsInput) {
  const mcpClient = new Client({
    name: "adulting-ai-chat",
    version: "1.0.0",
  });

  const headers: Record<string, string> = {
    "x-user-id": userId,
  };

  if (courseId) {
    headers["x-course-id"] = courseId;
  }

  if (MCP_INTERNAL_TOKEN) {
    headers.authorization = `Bearer ${MCP_INTERNAL_TOKEN}`;
  }

  const transport = new StreamableHTTPClientTransport(new URL(MCP_SERVER_URL), {
    requestInit: {
      headers,
    },
  });

  await mcpClient.connect(transport);

  try {
    const toolsResponse = await mcpClient.listTools();
        console.log(
            "MCP tools:",
            toolsResponse.tools.map((tool) => tool.name),
            );
    const openRouterTools = toolsResponse.tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema ?? {
          type: "object",
          properties: {},
        },
      },
    }));

    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    const maxToolRounds = 3;

    for (let round = 0; round < maxToolRounds; round += 1) {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Adulting App",
          },
          body: JSON.stringify({
            model: openRouterModel,
            messages,
            tools: openRouterTools,
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 700,
          }),
        },
      );

      const rawText = await response.text();

      let data: any;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("OpenRouter returnerade fel format");
      }

      if (!response.ok) {
        throw new Error(
          data?.error?.message ?? "OpenRouter kunde inte svara",
        );
      }

      const assistantMessage = data?.choices?.[0]?.message;

      if (!assistantMessage) {
        throw new Error("OpenRouter saknade assistant message");
      }

      const toolCalls = assistantMessage.tool_calls ?? [];

      if (!toolCalls.length) {
        const text = assistantMessage.content?.trim() ?? "";

        if (!text) {
          throw new Error("AI svarade tomt");
        }

        return text;
      }

      messages.push({
        role: "assistant",
        content: assistantMessage.content ?? null,
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        const toolName = toolCall.function?.name;
        const rawArguments = toolCall.function?.arguments ?? "{}";

        if (!toolName) {
          continue;
        }

        let parsedArguments: Record<string, unknown>;

        try {
          parsedArguments = JSON.parse(rawArguments);
        } catch {
          parsedArguments = {};
        }

        console.log("AI requested MCP tool:", toolName, parsedArguments);

        const toolResult = await mcpClient.callTool({
          name: toolName,
          arguments: parsedArguments,
        });

        console.log("MCP tool result received:", toolName);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(toolResult),
        });
      }
    }

    throw new Error("AI fastnade i för många tool-anrop");
  } finally {
    await mcpClient.close();
  }
}