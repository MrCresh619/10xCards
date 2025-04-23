import type { FlashcardProposalDTO } from "../../types";
import { supabaseClient } from "../../db/supabase.client";
import crypto from "crypto";

interface GenerationResult {
  generation_id: number;
  flashcards_proposals: FlashcardProposalDTO[];
  generated_count: number;
}

interface GenerationServiceOptions {
  timeoutMs?: number;
}

/**
 * Serwis odpowiedzialny za komunikację z zewnętrznym LLM API i przetwarzanie wyników generacji
 */
export class GenerationService {
  private readonly defaultTimeout = 60000; // 60 sekund domyślny timeout

  constructor(private options: GenerationServiceOptions = {}) {}

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
          model: "gpt-4", // przykładowa nazwa modelu
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

      // Wywołanie zewnętrznego API
      const result = await this.callExternalLLMApi(sourceText);
      const generationDuration = Math.floor((Date.now() - startTime) / 1000);

      // Propozycje flashcardów są zwracane do użytkownika bez zapisywania ich do bazy danych.

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
   * Tymczasowa implementacja wywołania zewnętrznego LLM API
   * W rzeczywistej implementacji byłoby to połączenie z faktycznym API (np. OpenAI)
   */
  private async callExternalLLMApi(
    sourceText: string
  ): Promise<Omit<GenerationResult, "generation_id">> {
    // Implementacja timeoutu dla wywołania API
    const timeoutMs = this.options.timeoutMs || this.defaultTimeout;

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
   * Właściwe wywołanie zewnętrznego API
   * W rzeczywistej implementacji tutaj znajdowałoby się wywołanie zewnętrznego API
   */
  private async _performApiCall(
    sourceText: string
  ): Promise<Omit<GenerationResult, "generation_id">> {
    // Symulacja opóźnienia odpowiedzi z API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Analiza tekstu przy pomocy prostego algorytmu
    const sentenceCount = sourceText.split(/[.!?]+/).filter(Boolean).length;
    const proposalsCount = Math.min(Math.max(Math.floor(sentenceCount / 10), 3), 10);

    // Generowanie odpowiedniej liczby flashcardów na podstawie proposalsCount
    const flashcards_proposals: FlashcardProposalDTO[] = [];

    // Przykładowe pytania i odpowiedzi
    const examples = [
      {
        front: "Jakie są główne zalety wykorzystania generatywnej AI w edukacji?",
        back: "Główne zalety to: personalizacja materiałów edukacyjnych, automatyzacja tworzenia materiałów dydaktycznych, wsparcie w uczeniu się poprzez generowanie przykładów i wyjaśnień dostosowanych do potrzeb ucznia.",
      },
      {
        front: "Jakie wyzwania etyczne wiążą się z wykorzystaniem AI w edukacji?",
        back: "Wyzwania etyczne obejmują: ochronę prywatności danych uczniów, zapewnienie równego dostępu do technologii, ryzyko pogłębienia nierówności edukacyjnych, oraz potencjalne uzależnienie od technologii kosztem rozwijania umiejętności krytycznego myślenia.",
      },
      {
        front: "W jaki sposób można zapewnić jakość flashcardów generowanych przez AI?",
        back: "Jakość flashcardów można zapewnić poprzez: weryfikację przez ekspertów dziedzinowych, implementację mechanizmów oceny przez użytkowników, stałe doskonalenie modeli AI na podstawie feedbacku, oraz połączenie automatycznej generacji z ludzką redakcją.",
      },
      {
        front:
          "Jakie są potencjalne zastosowania AI w tworzeniu spersonalizowanych materiałów edukacyjnych?",
        back: "Potencjalne zastosowania obejmują: generowanie ćwiczeń o różnym poziomie trudności, dostosowanie tempa nauki do indywidualnych potrzeb, tworzenie przykładów dopasowanych do zainteresowań ucznia oraz adaptacyjne testy, które dynamicznie dostosowują się do poziomu wiedzy.",
      },
      {
        front: "Jak AI może wspierać nauczycieli w ocenianiu prac uczniów?",
        back: "AI może wspierać nauczycieli poprzez: automatyczną wstępną ocenę odpowiedzi, identyfikację typowych błędów, generowanie konstruktywnej informacji zwrotnej oraz analizę postępów uczniów w czasie, co pozwala nauczycielom skupić się na bardziej złożonych aspektach edukacji.",
      },
    ];

    // Dodajemy tyle flashcardów, ile określa proposalsCount
    for (let i = 0; i < proposalsCount; i++) {
      const example = examples[i % examples.length]; // Cykliczne wybieranie przykładów
      flashcards_proposals.push({
        front: example.front,
        back: example.back,
        source: "ai-full",
      });
    }

    // Mockowana odpowiedź API - w rzeczywistej implementacji byłoby to wywołanie zewnętrznego API
    return {
      flashcards_proposals,
      generated_count: flashcards_proposals.length,
    };
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
