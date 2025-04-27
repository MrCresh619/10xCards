import { useState } from "react";
import type { CreateGenerationCommand, GenerationCreatedDTO } from "@/types";

export function useFlashcardGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<GenerationCreatedDTO | null>(null);

  const generateFlashcards = async (command: CreateGenerationCommand) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas generowania fiszek");
      }

      const data: GenerationCreatedDTO = await response.json();
      setGeneratedFlashcards(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateFlashcards,
    isLoading,
    error,
    generatedFlashcards,
  };
}
