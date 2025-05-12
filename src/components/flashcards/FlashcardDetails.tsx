import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, EditIcon, TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FlashcardForm } from "./FlashcardForm";
import type { FlashcardFormValues } from "@/lib/validations/flashcard";
import { toast } from "sonner";
import type { FlashcardDTO } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export function FlashcardDetails() {
  const [id, setId] = useState<string | null>(null);
  const [flashcard, setFlashcard] = useState<FlashcardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pobieramy ID z URL dopiero po załadowaniu po stronie klienta
  useEffect(() => {
    // Sprawdzamy czy kod jest wykonywany w przeglądarce
    if (typeof window !== "undefined") {
      const urlId = window.location.pathname.split("/").pop();
      setId(urlId || null);
    }
  }, []);

  // Pobieramy dane fiszki dopiero gdy mamy ID
  useEffect(() => {
    const fetchFlashcard = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/flashcards/${id}`);

        if (!response.ok) {
          throw new Error("Nie udało się pobrać fiszki");
        }

        const { data } = await response.json();
        setFlashcard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcard();
  }, [id]);

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditFlashcard = async (values: FlashcardFormValues) => {
    if (!flashcard) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: values.front,
          back: values.back,
          source: values.source === "ai-full" ? "ai-edited" : values.source,
          generated_id: values.generated_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować fiszki");
      }

      const { data } = await response.json();
      setFlashcard(data);
      setIsEditDialogOpen(false);
      toast.success("Fiszka została zaktualizowana pomyślnie");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji fiszki"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFlashcard = async () => {
    if (!flashcard) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/flashcards/${flashcard.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć fiszki");
      }

      setIsDeleteDialogOpen(false);
      toast.success("Fiszka została usunięta pomyślnie");

      // Przekierowanie na stronę z listą fiszek
      if (typeof window !== "undefined") {
        window.location.href = "/flashcards";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania fiszki");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBackToList = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/flashcards";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!flashcard) {
    return (
      <div className="flex items-center justify-center p-6">
        <p>Nie znaleziono fiszki</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={handleGoBackToList} className="flex items-center gap-2">
          <ChevronLeftIcon size={16} />
          Powrót do listy
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? "back" : "front"}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <Card className="w-full h-[300px] flex flex-col shadow-lg">
                <CardHeader className="flex-grow">
                  <CardTitle className="text-2xl text-center">
                    {isFlipped ? "Odpowiedź" : "Pytanie"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center p-6">
                  <p className="text-xl text-center">
                    {isFlipped ? flashcard.back : flashcard.front}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div>
                    <CardDescription>
                      Utworzono: {new Date(flashcard.created_at).toLocaleDateString("pl-PL")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleFlip}
                      aria-label={isFlipped ? "Pokaż pytanie" : "Pokaż odpowiedź"}
                    >
                      {isFlipped ? <ArrowLeftIcon size={16} /> : <ArrowRightIcon size={16} />}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={handleEditClick} className="flex items-center gap-2">
              <EditIcon size={16} />
              Edytuj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              className="flex items-center gap-2"
            >
              <TrashIcon size={16} />
              Usuń
            </Button>
          </div>
        </div>
      </div>

      {/* Modal edycji */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj fiszkę</DialogTitle>
          </DialogHeader>
          <FlashcardForm
            initialValues={
              flashcard.source === "manual"
                ? {
                    front: flashcard.front,
                    back: flashcard.back,
                    source: "manual" as const,
                  }
                : {
                    front: flashcard.front,
                    back: flashcard.back,
                    source: "ai-edited" as const,
                    generated_id: flashcard.generated_id ?? undefined,
                  }
            }
            onSubmit={handleEditFlashcard}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Modal usuwania */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń fiszkę</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteFlashcard} disabled={isSubmitting}>
              {isSubmitting ? "Usuwanie..." : "Usuń"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
