import { useState, useCallback } from "react";
import type { FlashcardDTO, FlashcardsListDTO, CreateFlashcardCommand, UpdateFlashcardCommand } from "@/types";

export const useFlashcards = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardsListDTO | null>(null);

  const loadFlashcards = useCallback(async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: "-created_at"
      });
      
      const response = await fetch(`/api/flashcards?${params}`);
      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas pobierania fiszek");
      }
      const { data, meta } = await response.json();
      setFlashcards({
        data,
        pagination: {
          page: meta.page,
          limit: meta.limit,
          total: meta.total
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFlashcard = useCallback(async (command: CreateFlashcardCommand) => {
    setError(null);
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });
      
      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas tworzenia fiszki");
      }
      
      await loadFlashcards(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas tworzenia fiszki");
      throw err;
    }
  }, [loadFlashcards]);

  const updateFlashcard = useCallback(async (id: number, command: UpdateFlashcardCommand) => {
    setError(null);
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });
      
      if (!response.ok) {
        setError("Wystąpił błąd podczas aktualizacji fiszki");
        throw new Error("Wystąpił błąd podczas aktualizacji fiszki");
      }
      
      if (flashcards) {
        await loadFlashcards(flashcards.pagination.page);
      }
    } catch (err) {
      if (!error) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas aktualizacji fiszki");
      }
      throw err;
    }
  }, [loadFlashcards, flashcards, error]);

  const deleteFlashcard = useCallback(async (id: number) => {
    setError(null);
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        setError("Wystąpił błąd podczas usuwania fiszki");
        throw new Error("Wystąpił błąd podczas usuwania fiszki");
      }
      
      if (flashcards) {
        await loadFlashcards(flashcards.pagination.page);
      }
    } catch (err) {
      if (!error) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania fiszki");
      }
      throw err;
    }
  }, [loadFlashcards, flashcards, error]);

  return {
    flashcards,
    isLoading,
    error,
    loadFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
  };
}; 