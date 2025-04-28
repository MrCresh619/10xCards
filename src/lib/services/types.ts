import { z } from "zod";

// Pomocniczy typ dla rekursywnego obiektu JSON
export type JSONSchema = Record<string, unknown> | unknown[] | string | number | boolean | null;

export interface ConfigOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: ResponseFormat;
  systemMessage?: string;
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: JSONSchema;
  };
}

export interface RouterResponse {
  status: string;
  data: Record<string, unknown>;
  error: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterPayload {
  model: string;
  messages: Message[];
  temperature: number;
  max_tokens: number;
  response_format?: ResponseFormat;
}

export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

// Schematy walidacji
export const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

// Elastyczny schemat odpowiedzi OpenRouter, który akceptuje różne formaty odpowiedzi
export const openRouterResponseSchema = z
  .object({
    choices: z
      .array(
        z.object({
          message: z.object({
            content: z.string(),
          }),
        })
      )
      .optional()
      .or(z.array(z.any())),
    message: z
      .object({
        content: z.string(),
      })
      .optional(),
    content: z.string().optional(),
  })
  .transform(data => {
    // Jeśli brakuje choices, utworzymy sztuczny format zgodny z oczekiwaną strukturą
    if (!data.choices) {
      return {
        choices: [
          {
            message: {
              content: data.message?.content || data.content || "{}",
            },
          },
        ],
      };
    }
    return data;
  });

export const routerResponseSchema = z.object({
  status: z.string(),
  data: z.record(z.unknown()),
  error: z.string(),
});
