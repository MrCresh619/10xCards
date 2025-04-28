import type { FlashcardProposalDTO } from "../../types";
import { supabaseClient } from "../../db/supabase.client";
import crypto from "crypto";
import { OpenRouterService } from "./openrouter.service";

interface GenerationResult {
  generation_id: number;
  flashcards_proposals: FlashcardProposalDTO[];
  generated_count: number;
}

interface GenerationServiceOptions {
  timeoutMs?: number;
  openRouterApiKey: string;
  openRouterModel?: string;
}

/**
 * Serwis odpowiedzialny za komunikację z zewnętrznym LLM API i przetwarzanie wyników generacji
 */
export class GenerationService {
  private readonly defaultTimeout = 60000; // 60 sekund domyślny timeout
  private openRouterService: OpenRouterService;

  constructor(private options: Partial<GenerationServiceOptions> = {}) {
    const apiKey = options.openRouterApiKey || import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OpenRouter API key jest wymagany. Podaj klucz w opcjach lub ustaw zmienną środowiskową OPENROUTER_API_KEY."
      );
    }

    this.openRouterService = new OpenRouterService(
      apiKey,
      options.openRouterModel || "openai/gpt-4o-mini",
      { temperature: 0.7, maxTokens: 2000 },
      this.getSystemPrompt()
    );

    // Ustawienie formatu odpowiedzi osobno
    this.openRouterService.configure({
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "flashcards",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" },
                  },
                  required: ["front", "back"],
                },
              },
            },
            required: ["flashcards"],
          },
        },
      },
    });
  }

  /**
   * Wywołuje zewnętrzne LLM API w celu wygenerowania propozycji flashcardów
   * @param sourceText - Tekst źródłowy do analizy
   * @param userId - ID zalogowanego użytkownika
   * @returns Obiekt zawierający propozycje flashcardów i informacje o generacji
   */
  async generateFlashcards(sourceText: string, userId: string): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // Generowanie hasha tekstu przy użyciu MD5
      const sourceTextHash = this.generateTextHash(sourceText);

      // Zapisanie informacji o rozpoczęciu generacji w bazie danych
      const { data: generationRecord, error: insertError } = await supabaseClient
        .from("generations")
        .insert({
          user_id: userId,
          source_text_length: sourceText.length,
          source_text_hash: sourceTextHash,
          model: this.options.openRouterModel || "openai/gpt-4o-mini",
          generated_count: 0, // początkowo 0, zaktualizujemy po generacji
          generation_duration: 0, // początkowo 0, zaktualizujemy po generacji
        })
        .select()
        .single();

      if (insertError || !generationRecord) {
        throw new Error(
          `Błąd podczas zapisywania generacji: ${insertError?.message || "Nie udało się utworzyć rekordu generacji"}`
        );
      }

      // Wywołanie zewnętrznego API poprzez OpenRouterService
      const result = await this.callExternalLLMApi(sourceText);
      const generationDuration = Math.floor((Date.now() - startTime) / 1000);

      // Aktualizacja rekordu generacji po zakończeniu
      const { error: updateError } = await supabaseClient
        .from("generations")
        .update({
          generated_count: result.generated_count,
          generation_duration: generationDuration,
        })
        .eq("id", generationRecord.id);

      if (updateError) {
        console.error("Błąd podczas aktualizacji rekordu generacji:", updateError);
      }

      // Dodajemy generation_id do wyniku
      return {
        ...result,
        generation_id: generationRecord.id,
      };
    } catch (error) {
      // Obsługa i logowanie błędów
      console.error("Błąd podczas generacji flashcardów:", error);

      // Generowanie hasha dla logu błędu
      const sourceTextHash = this.generateTextHash(sourceText);

      await this.logGenerationError(userId, sourceTextHash, sourceText.length, error);
      throw error;
    }
  }

  /**
   * Wywołanie zewnętrznego LLM API poprzez OpenRouterService
   */
  private async callExternalLLMApi(
    sourceText: string
  ): Promise<Omit<GenerationResult, "generation_id">> {
    // Implementacja timeoutu dla wywołania API
    const timeoutMs = this.options?.timeoutMs || this.defaultTimeout;

    try {
      // Stworzenie promisa z timeoutem
      const apiCallPromise = this._performApiCall(sourceText);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Timeout podczas wywoływania zewnętrznego API")),
          timeoutMs
        );
      });

      // Wywołanie API z obsługą timeoutu
      return await Promise.race([apiCallPromise, timeoutPromise]);
    } catch (error) {
      console.error("Błąd podczas wywoływania zewnętrznego API:", error);

      // Jeżeli wystąpił timeout, zwróć odpowiednią informację
      if (error instanceof Error && error.message.includes("Timeout")) {
        throw new Error(`Upłynął limit czasu (${timeoutMs}ms) podczas generowania flashcardów`);
      }

      throw error;
    }
  }

  /**
   * Właściwe wywołanie zewnętrznego API poprzez OpenRouterService
   */
  private async _performApiCall(
    sourceText: string
  ): Promise<Omit<GenerationResult, "generation_id">> {
    const prompt = `Przeanalizuj poniższy tekst i stwórz fiszki edukacyjne (flashcards).
Na przedniej stronie fiszki powinna być umieszczona precyzyjna treść pytania.
Na tylnej stronie fiszki powinna znaleźć się kompletna odpowiedź.
Zwróć wynik w formacie JSON jako tablicę obiektów z polami: 'front' i 'back'.

Tekst do analizy:
${sourceText}`;

    console.log("Uruchamiam generację fiszek. Długość tekstu:", sourceText.length);

    try {
      const response = await this.openRouterService.sendMessage(prompt);
      console.log("Otrzymano odpowiedź od OpenRouter:", JSON.stringify(response, null, 2));

      if (response.status === "error") {
        throw new Error(`Błąd podczas generowania fiszek: ${response.error}`);
      }

      const flashcardsData = response.data as {
        flashcards?: { front: string; back: string }[];
      };
      console.log("Dane fiszek:", JSON.stringify(flashcardsData, null, 2));

      if (!flashcardsData.flashcards || !Array.isArray(flashcardsData.flashcards)) {
        console.error("Nieprawidłowy format odpowiedzi:", flashcardsData);
        throw new Error("Odpowiedź API nie zawiera tablicy fiszek");
      }

      const flashcards_proposals: FlashcardProposalDTO[] = flashcardsData.flashcards.map(card => ({
        front: card.front || "",
        back: card.back || "",
        source: "ai-full",
      }));

      console.log(`Wygenerowano ${flashcards_proposals.length} fiszek`);

      return {
        flashcards_proposals,
        generated_count: flashcards_proposals.length,
      };
    } catch (error) {
      console.error("Błąd podczas generowania fiszek:", error);
      throw error;
    }
  }

  /**
   * Zwraca systemowy prompt dla modelu LLM
   */
  private getSystemPrompt(): string {
    return `Jesteś zaawansowanym asystentem specjalizującym się w tworzeniu fiszek edukacyjnych.
Twoim zadaniem jest analiza podanego tekstu i utworzenie zbioru fiszek, które pomogą użytkownikowi zapamiętać najważniejsze informacje.

Zasady tworzenia fiszek:
1. Twórz fiszki zawierające najważniejsze koncepcje, definicje i fakty z tekstu
2. Na przedniej stronie fiszki umieszczaj precyzyjne pytanie
3. Na tylnej stronie fiszki umieszczaj pełną, kompletną odpowiedź
4. Używaj jasnego, zwięzłego języka
5. Unikaj zbyt ogólnych pytań
6. Fiszki powinny być samodzielne (nie wymagać kontekstu z innych fiszek)
7. Ogranicz się do 5-10 fiszek, zależnie od długości tekstu

BARDZO WAŻNE - Twoja odpowiedź musi być w formacie JSON z dokładnie taką strukturą:
{
  "flashcards": [
    {
      "front": "Pytanie na przedniej stronie fiszki",
      "back": "Odpowiedź na tylnej stronie fiszki"
    },
    // więcej fiszek w tym samym formacie
  ]
}

Nie dodawaj żadnych dodatkowych właściwości ani komentarzy poza tym schematem.`;
  }

  /**
   * Generuje hash tekstu źródłowego dla celów śledzenia duplikatów
   * Używa algorytmu MD5 z biblioteki crypto
   */
  private generateTextHash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  /**
   * Zapisuje informacje o błędzie generacji w bazie danych
   */
  private async logGenerationError(
    userId: string,
    sourceTextHash: string,
    sourceTextLength: number,
    error: unknown
  ): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode =
        error instanceof Error && "code" in error
          ? String((error as Record<string, unknown>).code)
          : "UNKNOWN";

      await supabaseClient.from("generations_error_logs").insert({
        user_id: userId,
        error_message: errorMessage,
        error_code: errorCode,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
      });
    } catch (logError) {
      console.error("Nie udało się zapisać logu błędu:", logError);
    }
  }

  /**
   * Zapisuje propozycje flashcardów w bazie danych
   * @param flashcards - Lista propozycji flashcardów do zapisania
   * @param generationId - ID powiązanej generacji
   * @param userId - ID użytkownika
   */
  private async saveFlashcardProposals(
    flashcards: FlashcardProposalDTO[],
    generationId: number,
    userId: string
  ): Promise<void> {
    try {
      // Przygotowanie danych do zapisania
      const flashcardsToSave = flashcards.map(flashcard => ({
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        user_id: userId,
        generated_id: generationId,
      }));

      // Zapisanie wszystkich flashcardów w jednym zapytaniu
      const { error } = await supabaseClient.from("flashcards").insert(flashcardsToSave);

      if (error) {
        console.error("Błąd podczas zapisywania propozycji flashcardów:", error);
      }
    } catch (error) {
      console.error("Nie udało się zapisać propozycji flashcardów:", error);
    }
  }
}
