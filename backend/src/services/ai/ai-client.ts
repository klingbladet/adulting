import { z } from "zod";


export type AiMessageRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type AiClientOptions = {
 
  apiKey?: string;
  model?: string;
  siteUrl?: string;
  appName?: string;
};

export type ChatModelInput = {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type JsonModelInput<TSchema extends z.ZodTypeAny> = {
  messages: AiMessage[];
  schema: TSchema;
  temperature?: number;
  maxTokens?: number;
  schemaName?: string;
};

export class AiClientError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AiClientError";
  }
}

const openRouterResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullable().optional(),
        }),
      }),
    )
    .min(1),
});

export function createAiClient(options: AiClientOptions = {}) {
  const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY;

  const model =
    options.model ??
    process.env.OPENROUTER_MODEL ??
    "openai/gpt-4o-mini";

  const siteUrl =
    options.siteUrl ??
    process.env.OPENROUTER_SITE_URL ??
    "http://localhost:3000";

  const appName =
    options.appName ??
    process.env.OPENROUTER_APP_NAME ??
    "Adulting Learning App";

  async function callOpenRouter(input: {
    messages: AiMessage[];
    temperature: number;
    maxTokens: number;
  }): Promise<string> {
    if (!apiKey) {
      throw new AiClientError(
        "OPENROUTER_API_KEY saknas. Lägg till den i backend/.env.",
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": appName,
        },
        body: JSON.stringify({
          model,
          messages: input.messages,
          temperature: input.temperature,
          max_tokens: input.maxTokens,
        }),
      },
    );

    const rawText = await response.text();

    let rawJson: unknown;

    try {
      rawJson = JSON.parse(rawText);
    } catch (error) {
      throw new AiClientError(
        `OpenRouter returnerade inte giltig JSON. Status: ${response.status}. Body: ${rawText.slice(
          0,
          500,
        )}`,
        error,
      );
    }

    if (!response.ok) {
      const errorMessage = extractOpenRouterErrorMessage(rawJson);

      throw new AiClientError(
        `OpenRouter-anrop misslyckades. Status: ${response.status}. ${errorMessage}`,
        rawJson,
      );
    }

    const parsed = openRouterResponseSchema.safeParse(rawJson);

    if (!parsed.success) {
      throw new AiClientError(
        "OpenRouter-svaret hade oväntat format.",
        parsed.error,
      );
    }

    const content = parsed.data.choices[0]?.message?.content;

    if (!content) {
      throw new AiClientError("AI-modellen returnerade tomt svar.");
    }

    return content;
  }

  return {
   
    async chat(input: ChatModelInput): Promise<string> {
      return callOpenRouter({
        messages: input.messages,
        temperature: input.temperature ?? 0.4,
        maxTokens: input.maxTokens ?? 1200,
      });
    },

    async generateJson<TSchema extends z.ZodTypeAny>(
      input: JsonModelInput<TSchema>,
    ): Promise<z.infer<TSchema>> {
      const content = await callOpenRouter({
        messages: withJsonInstruction(input.messages),
        temperature: input.temperature ?? 0.2,
        maxTokens: input.maxTokens ?? 3000,
      });

      const jsonText = extractJsonFromModelContent(content);

      let parsedJson: unknown;

      try {
        parsedJson = JSON.parse(jsonText);
      } catch (error) {
        throw new AiClientError(
          [
            `AI-modellen returnerade inte giltig JSON${
              input.schemaName ? ` för ${input.schemaName}` : ""
            }.`,
            `Svar: ${content.slice(0, 1000)}`,
          ].join(" "),
          error,
        );
      }

      const parsed = input.schema.safeParse(parsedJson);

      if (!parsed.success) {
        throw new AiClientError(
          [
            `AI JSON matchade inte förväntat schema${
              input.schemaName ? `: ${input.schemaName}` : ""
            }.`,
            parsed.error.message,
          ].join(" "),
          parsed.error,
        );
      }

      return parsed.data;
    },
  };
}

export type AiClient = ReturnType<typeof createAiClient>;

export const defaultAiClient = createAiClient();

function withJsonInstruction(messages: AiMessage[]): AiMessage[] {
  return [
    {
      role: "system",
      content:
        "När du ombeds returnera JSON ska du returnera strikt giltig JSON. Inga markdown-block, inga kommentarer, ingen extra text före eller efter JSON.",
    },
    ...messages,
  ];
}

export function extractJsonFromModelContent(content: string): string {
  const trimmed = content.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedJsonMatch = trimmed.match(
    /```(?:json)?\s*([\s\S]*?)\s*```/i,
  );

  if (fencedJsonMatch?.[1]) {
    return fencedJsonMatch[1].trim();
  }

  const firstCurly = trimmed.indexOf("{");
  const lastCurly = trimmed.lastIndexOf("}");

  if (firstCurly >= 0 && lastCurly > firstCurly) {
    return trimmed.slice(firstCurly, lastCurly + 1).trim();
  }

  return trimmed;
}


function extractOpenRouterErrorMessage(rawJson: unknown): string {
  const schema = z.object({
    error: z
      .object({
        message: z.string().optional(),
      })
      .optional(),
  });

  const parsed = schema.safeParse(rawJson);

  if (parsed.success && parsed.data.error?.message) {
    return parsed.data.error.message;
  }

  return "Okänt fel från OpenRouter.";
}