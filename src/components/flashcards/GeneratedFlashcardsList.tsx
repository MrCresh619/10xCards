import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FlashcardProposalDTO } from "@/types";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GeneratedFlashcardsListProps {
  flashcards: FlashcardProposalDTO[];
  onAccept: (flashcard: FlashcardProposalDTO) => void;
  onReject?: (flashcard: FlashcardProposalDTO) => void;
  onEdit: (originalFlashcard: FlashcardProposalDTO, editedFlashcard: FlashcardProposalDTO) => void;
}

export function GeneratedFlashcardsList({
  flashcards,
  onAccept,
  onReject,
  onEdit,
}: GeneratedFlashcardsListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFlashcardIndex, setSelectedFlashcardIndex] = useState<number | null>(null);
  const [editedFront, setEditedFront] = useState("");
  const [editedBack, setEditedBack] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localFlashcards, setLocalFlashcards] = useState<FlashcardProposalDTO[]>([]);
  const [acceptedFlashcardsIndices, setAcceptedFlashcardsIndices] = useState<number[]>([]);

  // Inicjalizacja listy fiszek przy pierwszym renderowaniu
  useEffect(() => {
    setLocalFlashcards(flashcards);
  }, [flashcards]);

  const handleEditClick = (index: number) => {
    const flashcard = localFlashcards[index];
    setSelectedFlashcardIndex(index);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setValidationError(null);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (selectedFlashcardIndex === null) return;

    try {
      if (editedFront.length < 3 || editedFront.length > 200) {
        setValidationError("Pytanie musi zawierać od 3 do 200 znaków");
        return;
      }

      if (editedBack.length < 3 || editedBack.length > 500) {
        setValidationError("Odpowiedź musi zawierać od 3 do 500 znaków");
        return;
      }

      const originalFlashcard = localFlashcards[selectedFlashcardIndex];

      // Tworzymy edytowaną fiszkę
      const editedFlashcard: FlashcardProposalDTO = {
        ...originalFlashcard,
        front: editedFront,
        back: editedBack,
        source: "ai-edited",
      };

      // Aktualizacja lokalnego stanu fiszek
      setLocalFlashcards(prevFlashcards => {
        const updatedFlashcards = [...prevFlashcards];
        updatedFlashcards[selectedFlashcardIndex] = editedFlashcard;
        return updatedFlashcards;
      });

      // WAŻNE: najpierw informujemy o edycji (nie powoduje to zaakceptowania)
      onEdit(originalFlashcard, editedFlashcard);

      setIsEditDialogOpen(false);
      setSelectedFlashcardIndex(null);
      setValidationError(null);
    } catch (error: unknown) {
      console.error("Błąd podczas edycji fiszki:", error);
      if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError("Nieprawidłowe dane formularza");
      }
    }
  };

  const handleAcceptToggle = (index: number) => {
    const flashcard = localFlashcards[index];
    const isCurrentlyAccepted = acceptedFlashcardsIndices.includes(index);

    if (isCurrentlyAccepted) {
      // Odrzucanie fiszki - aktualizujemy stan lokalny
      setAcceptedFlashcardsIndices(prev => prev.filter(idx => idx !== index));

      // Informujemy komponent nadrzędny
      if (onReject) {
        onReject(flashcard);
      }
    } else {
      // Akceptowanie fiszki - aktualizujemy stan lokalny
      setAcceptedFlashcardsIndices(prev => [...prev, index]);

      // Informujemy komponent nadrzędny
      onAccept(flashcard);
    }
  };

  const isFlashcardAccepted = (index: number) => {
    return acceptedFlashcardsIndices.includes(index);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {localFlashcards.map((flashcard, index) => (
          <motion.div
            key={`flashcard-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">Fiszka {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isFlashcardAccepted(index)}
                      onCheckedChange={() => handleAcceptToggle(index)}
                    />
                    <Label>Akceptuj</Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Przód:</h4>
                  <p className="text-sm text-muted-foreground">{flashcard.front}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Tył:</h4>
                  <p className="text-sm text-muted-foreground">{flashcard.back}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleEditClick(index)}
                >
                  Edytuj
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj fiszkę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {validationError && (
              <Alert variant="destructive">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="front-input" className="text-sm font-medium">
                Przód fiszki
              </label>
              <Textarea
                id="front-input"
                value={editedFront}
                onChange={e => {
                  setEditedFront(e.target.value);
                  setValidationError(null);
                }}
                placeholder="Wprowadź pytanie..."
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {editedFront.length}/200 znaków
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="back-input" className="text-sm font-medium">
                Tył fiszki
              </label>
              <Textarea
                id="back-input"
                value={editedBack}
                onChange={e => {
                  setEditedBack(e.target.value);
                  setValidationError(null);
                }}
                placeholder="Wprowadź odpowiedź..."
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {editedBack.length}/500 znaków
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleEditSubmit}>Zapisz zmiany</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
