import { useEffect, useState } from "react";
import { useFlashcards } from "../hooks/useFlashcards";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
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
import { ExternalLinkIcon, Edit2Icon, Trash2Icon } from "lucide-react";

interface FlashcardsListProps {
  userId: string;
}

export const FlashcardsList = ({ userId }: FlashcardsListProps) => {
  const {
    flashcards,
    isLoading,
    error,
    loadFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
  } = useFlashcards(userId);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<FlashcardDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFlashcards(currentPage);
  }, [loadFlashcards, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddFlashcard = async (values: FlashcardFormValues) => {
    try {
      setIsSubmitting(true);
      await createFlashcard(values);
      setIsAddDialogOpen(false);
      toast.success("Fiszka została dodana pomyślnie");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił błąd podczas dodawania fiszki"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (flashcard: FlashcardDTO) => {
    setSelectedFlashcard(flashcard);
    setIsEditDialogOpen(true);
  };

  const handleEditFlashcard = async (values: FlashcardFormValues) => {
    if (!selectedFlashcard) return;

    try {
      setIsSubmitting(true);
      await updateFlashcard(selectedFlashcard.id, {
        front: values.front,
        back: values.back,
        source: values.source === "ai-full" ? "ai-edited" : values.source,
        generated_id: values.generated_id,
      });
      setIsEditDialogOpen(false);
      setSelectedFlashcard(null);
      toast.success("Fiszka została zaktualizowana pomyślnie");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji fiszki"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (flashcard: FlashcardDTO) => {
    setSelectedFlashcard(flashcard);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFlashcard = async () => {
    if (!selectedFlashcard) return;

    try {
      setIsSubmitting(true);
      await deleteFlashcard(selectedFlashcard.id);
      setIsDeleteDialogOpen(false);
      setSelectedFlashcard(null);
      toast.success("Fiszka została usunięta pomyślnie");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania fiszki");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (id: number) => {
    window.location.href = `/flashcards/${id}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  const isEmpty = !flashcards?.data || flashcards.data.length === 0;
  const totalPages =
    !isEmpty && Math.ceil((flashcards.pagination.total || 0) / flashcards.pagination.limit);

  return (
    <>
      {isEmpty ? (
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader className="flex flex-col items-center justify-center w-full">
            <CardTitle>Nie masz jeszcze żadnych fiszek</CardTitle>
            <CardDescription>
              Rozpocznij naukę dodając swoją pierwszą fiszkę lub generując fiszki z tekstu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddDialogOpen(true)}>Dodaj pierwszą fiszkę</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-end">
            <Button onClick={() => setIsAddDialogOpen(true)}>Dodaj nową fiszkę</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashcards.data.map(flashcard => (
              <Card key={flashcard.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{flashcard.front}</CardTitle>
                  <CardDescription>
                    Utworzono: {new Date(flashcard.created_at).toLocaleDateString("pl-PL")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{flashcard.back}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(flashcard.id)}
                    className="flex items-center gap-1"
                  >
                    <ExternalLinkIcon size={16} />
                    Szczegóły
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(flashcard)}
                    className="flex items-center gap-1"
                  >
                    <Edit2Icon size={16} />
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(flashcard)}
                    className="flex items-center gap-1"
                  >
                    <Trash2Icon size={16} />
                    Usuń
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages && totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationFirst
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLast
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edytuj fiszkę</DialogTitle>
              </DialogHeader>
              <FlashcardForm
                initialValues={
                  selectedFlashcard?.source === "manual"
                    ? {
                        front: selectedFlashcard.front,
                        back: selectedFlashcard.back,
                        source: "manual" as const,
                      }
                    : selectedFlashcard
                      ? {
                          front: selectedFlashcard.front,
                          back: selectedFlashcard.back,
                          source: "ai-edited" as const,
                          generated_id: selectedFlashcard.generated_id ?? undefined,
                        }
                      : undefined
                }
                onSubmit={handleEditFlashcard}
                onCancel={() => setIsEditDialogOpen(false)}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>

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
                <Button
                  variant="destructive"
                  onClick={handleDeleteFlashcard}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Usuwanie..." : "Usuń"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nową fiszkę</DialogTitle>
          </DialogHeader>
          <FlashcardForm
            onSubmit={handleAddFlashcard}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
