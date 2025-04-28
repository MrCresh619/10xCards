import type {
  ConfigOptions,
  ResponseFormat,
  RouterResponse,
  OpenRouterPayload,
  Message,
  RetryOptions,
} from "./types";
import { messageSchema, openRouterResponseSchema, routerResponseSchema } from "./types";

// Klasa serwisu OpenRouter
export class OpenRouterService {
  private readonly apiKey: string;
  private defaultModel: string;
  private modelParameters: {
    temperature: number;
    maxTokens: number;
  };
  private _systemMessage: string;
  private _responseFormat: ResponseFormat;
  private readonly API_URL = "https://openrouter.ai/api/v1/chat/completions";
  private readonly retryOptions: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  };

  constructor(
    apiKey: string,
    defaultModel = "openai/gpt-4o-mini",
    modelParameters = {
      temperature: 0.7,
      maxTokens: 1000,
    },
    systemMessage = "You are a helpful assistant.",
    responseFormat?: ResponseFormat
  ) {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    this.modelParameters = modelParameters;
    this._systemMessage = systemMessage;
    this._responseFormat = responseFormat || {
      type: "json_schema",
      json_schema: {
        name: "router_response",
        strict: true,
        schema: {
          status: "string",
          data: "object",
          error: "string",
        },
      },
    };
  }

  // Publiczne metody
  public async sendMessage(content: string): Promise<RouterResponse> {
    try {
      const payload = this._buildRequestPayload(content);
      const response = await this._sendRequestWithRetry(payload);
      return this._handleResponse(response);
    } catch (error) {
      return this._handleError(error);
    }
  }

  public configure(options: ConfigOptions): void {
    if (options.model) this.defaultModel = options.model;
    if (options.temperature) this.modelParameters.temperature = options.temperature;
    if (options.maxTokens) this.modelParameters.maxTokens = options.maxTokens;
    if (options.responseFormat) this._responseFormat = options.responseFormat;
    if (options.systemMessage) this._systemMessage = options.systemMessage;
  }

  // Prywatne metody
  private _buildRequestPayload(content: string): OpenRouterPayload {
    const systemMessage: Message = {
      role: "system",
      content: this._systemMessage,
    };
    const userMessage: Message = {
      role: "user",
      content,
    };

    messageSchema.parse(systemMessage);
    messageSchema.parse(userMessage);

    return {
      model: this.defaultModel,
      messages: [systemMessage, userMessage],
      temperature: this.modelParameters.temperature,
      max_tokens: this.modelParameters.maxTokens,
      response_format: this._responseFormat,
    };
  }

  private async _sendRequestWithRetry(payload: OpenRouterPayload): Promise<Response> {
    let lastError: Error | null = null;
    let delay = this.retryOptions.initialDelay;

    for (let attempt = 1; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        return await this._sendRequest(payload);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error occurred");

        if (attempt === this.retryOptions.maxRetries) {
          throw lastError;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, this.retryOptions.maxDelay);
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  private async _sendRequest(payload: OpenRouterPayload): Promise<Response> {
    console.log("Wysyłam żądanie do OpenRouter API:", JSON.stringify(payload, null, 2));

    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://10xdevs.com",
        "X-Title": "10xCards Flashcards App",
      },
      body: JSON.stringify(payload),
    });

    console.log("Status odpowiedzi:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Błąd odpowiedzi API:", errorData);

      // Ten błąd zawsze występuje przy próbie użycia response_format z Azure
      if (errorData.error?.message?.includes("additionalProperties")) {
        console.log("Przechwycony błąd walidacji schematu - kontynuuję bez response_format");

        // Powrót z nowym żądaniem bez response_format
        const newPayload = { ...payload };
        delete newPayload.response_format;

        return this._sendRequestWithoutResponseFormat(newPayload);
      }

      throw new Error(errorData.error?.message || "Failed to communicate with OpenRouter API");
    }

    return response;
  }

  private async _sendRequestWithoutResponseFormat(
    payload: Omit<OpenRouterPayload, "response_format">
  ): Promise<Response> {
    console.log("Próbuję ponownie bez response_format:", JSON.stringify(payload, null, 2));

    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://10xdevs.com",
        "X-Title": "10xCards Flashcards App",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Błąd po usunięciu response_format:", errorData);
      throw new Error(errorData.error?.message || "Failed to communicate with OpenRouter API");
    }

    return response;
  }

  private async _handleResponse(response: Response): Promise<RouterResponse> {
    try {
      const rawData = await response.json();
      console.log("Surowa odpowiedź z API:", JSON.stringify(rawData, null, 2));

      if (rawData.error) {
        console.error("API zwróciło błąd:", rawData.error);
        return {
          status: "error",
          data: {},
          error: `Błąd API: ${rawData.error.message || JSON.stringify(rawData.error)}`,
        };
      }

      try {
        const validatedData = openRouterResponseSchema.parse(rawData);
        console.log("Zwalidowane dane:", JSON.stringify(validatedData, null, 2));

        const choice = validatedData.choices?.[0]?.message?.content;
        console.log("Wybrana treść odpowiedzi:", choice);

        if (!choice) {
          throw new Error("Invalid response format from API");
        }

        try {
          // Próba sparsowania odpowiedzi jako JSON
          const parsedChoice = JSON.parse(choice);
          console.log("Sparsowana odpowiedź JSON:", JSON.stringify(parsedChoice, null, 2));

          // Sprawdź, czy mamy prawidłową strukturę - jeśli nie, stwórz ją
          if (
            !parsedChoice.flashcards &&
            (Array.isArray(parsedChoice) || typeof parsedChoice === "object")
          ) {
            console.log("Konwertuję odpowiedź do oczekiwanego formatu");

            // Jeśli odpowiedź jest tablicą obiektów z front i back
            if (
              Array.isArray(parsedChoice) &&
              parsedChoice.length > 0 &&
              typeof parsedChoice[0] === "object" &&
              "front" in parsedChoice[0] &&
              "back" in parsedChoice[0]
            ) {
              return {
                status: "success",
                data: { flashcards: parsedChoice },
                error: "",
              };
            }

            // Sprawdź, czy wewnątrz obiektu nie ma odpowiedniej struktury
            for (const key in parsedChoice) {
              if (
                Array.isArray(parsedChoice[key]) &&
                parsedChoice[key].length > 0 &&
                typeof parsedChoice[key][0] === "object" &&
                "front" in parsedChoice[key][0] &&
                "back" in parsedChoice[key][0]
              ) {
                return {
                  status: "success",
                  data: { flashcards: parsedChoice[key] },
                  error: "",
                };
              }
            }
          }

          const routerResponse: RouterResponse = {
            status: "success",
            data: parsedChoice,
            error: "",
          };

          return routerResponseSchema.parse(routerResponse);
        } catch (parseError) {
          console.error("Błąd parsowania JSON:", parseError);
          console.log("Otrzymana treść:", choice);
          throw new Error(
            `Nie udało się sparsować odpowiedzi JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
          );
        }
      } catch (validationError) {
        console.error("Błąd walidacji odpowiedzi API:", validationError);

        if (rawData && typeof rawData === "object") {
          const content =
            rawData.choices?.[0]?.message?.content || rawData.message?.content || rawData.content;

          if (content && typeof content === "string") {
            console.log("Znaleziono treść odpowiedzi w alternatywnej strukturze:", content);
            try {
              const parsedContent = JSON.parse(content);

              // Podobna konwersja jak wyżej
              if (
                !parsedContent.flashcards &&
                (Array.isArray(parsedContent) || typeof parsedContent === "object")
              ) {
                // Jeśli odpowiedź jest tablicą obiektów z front i back
                if (
                  Array.isArray(parsedContent) &&
                  parsedContent.length > 0 &&
                  typeof parsedContent[0] === "object" &&
                  "front" in parsedContent[0] &&
                  "back" in parsedContent[0]
                ) {
                  return {
                    status: "success",
                    data: { flashcards: parsedContent },
                    error: "",
                  };
                }

                // Sprawdź, czy wewnątrz obiektu nie ma odpowiedniej struktury
                for (const key in parsedContent) {
                  if (
                    Array.isArray(parsedContent[key]) &&
                    parsedContent[key].length > 0 &&
                    typeof parsedContent[key][0] === "object" &&
                    "front" in parsedContent[key][0] &&
                    "back" in parsedContent[key][0]
                  ) {
                    return {
                      status: "success",
                      data: { flashcards: parsedContent[key] },
                      error: "",
                    };
                  }
                }
              }

              return {
                status: "success",
                data: parsedContent,
                error: "",
              };
            } catch (e) {
              console.error("Nie udało się sparsować alternatywnej treści:", e);
            }
          }
        }

        throw validationError;
      }
    } catch (error) {
      console.error("Szczegóły błędu API:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to parse API response: ${error.message}`);
      }
      throw new Error("Failed to parse API response");
    }
  }

  private _handleError(error: unknown): RouterResponse {
    const errorResponse: RouterResponse = {
      status: "error",
      data: {},
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    return routerResponseSchema.parse(errorResponse);
  }
}
