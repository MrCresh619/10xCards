import { useState } from "react";
import type {
  CreateFlashcardsCommand,
  CreateFlashcardsResponseDTO,
  FlashcardProposalDTO,
} from "@/types";

export function useFlashcardsSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlashcards, setSavedFlashcards] = useState<CreateFlashcardsResponseDTO | null>(null);

  const saveFlashcards = async (
    flashcards: FlashcardProposalDTO[],
    generationId: number
  ): Promise<CreateFlashcardsResponseDTO | null> => {
    try {
      setIsSaving(true);
      setError(null);

      const command: CreateFlashcardsCommand = {
        flashcards: flashcards.map(f => ({
          front: f.front,
          back: f.back,
          source: f.source,
          generated_id: generationId,
        })),
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas zapisywania fiszek");
      }

      const data: CreateFlashcardsResponseDTO = await response.json();
      setSavedFlashcards(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveFlashcards,
    isSaving,
    error,
    savedFlashcards,
  };
}
