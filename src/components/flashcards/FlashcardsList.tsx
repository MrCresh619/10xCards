import { useState } from "react";
import type { FlashcardProposalDTO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardsListProps {
  flashcards: FlashcardProposalDTO[];
  onAccept: (flashcard: FlashcardProposalDTO) => void;
  onReject: (flashcard: FlashcardProposalDTO) => void;
  onEdit: (flashcard: FlashcardProposalDTO, editedFlashcard: FlashcardProposalDTO) => void;
}

interface FlashcardItemProps extends FlashcardProposalDTO {
  onAccept: () => void;
  onReject: () => void;
  onEdit: (editedFlashcard: FlashcardProposalDTO) => void;
  index: number;
}

function FlashcardItem({
  front,
  back,
  source,
  onAccept,
  onReject,
  onEdit,
  index,
}: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(front);
  const [editedBack, setEditedBack] = useState(back);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleEdit = () => {
    if (isEditing) {
      const editedFlashcard: FlashcardProposalDTO = {
        front: editedFront,
        back: editedBack,
        source: "ai-edited" as const,
      };
      onEdit(editedFlashcard);
      setIsAccepted(true);
    }
    setIsEditing(!isEditing);
  };

  const handleAcceptToggle = (checked: boolean) => {
    setIsAccepted(checked);
    if (checked) {
      onAccept();
    } else {
      onReject();
    }
  };

  const isValid =
    editedFront.length >= 3 &&
    editedFront.length <= 200 &&
    editedBack.length >= 3 &&
    editedBack.length <= 500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            Fiszka {source === "ai-edited" ? "(edytowana)" : ""}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isAccepted}
              onCheckedChange={handleAcceptToggle}
              aria-label="Zaakceptuj fiszkę"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isEditing && !isValid}
            >
              {isEditing ? "Zapisz" : "Edytuj"}
            </Button>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedFront(front);
                    setEditedBack(back);
                  }}
                >
                  Anuluj
                </Button>
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={`front-${index}`} className="text-sm font-medium">
                  Przód:
                </label>
                {isEditing && (
                  <span
                    className={`text-xs ${editedFront.length > 200 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {editedFront.length}/200 znaków
                  </span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <Textarea
                    id={`front-${index}`}
                    value={editedFront}
                    onChange={e => setEditedFront(e.target.value)}
                    className="mt-1"
                    placeholder="Wprowadź tekst przodu fiszki..."
                  />
                </div>
              ) : (
                <p className="mt-1 text-sm">{front}</p>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={`back-${index}`} className="text-sm font-medium">
                  Tył:
                </label>
                {isEditing && (
                  <span
                    className={`text-xs ${editedBack.length > 500 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {editedBack.length}/500 znaków
                  </span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <Textarea
                    id={`back-${index}`}
                    value={editedBack}
                    onChange={e => setEditedBack(e.target.value)}
                    className="mt-1"
                    placeholder="Wprowadź tekst tyłu fiszki..."
                  />
                </div>
              ) : (
                <p className="mt-1 text-sm">{back}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FlashcardsList({ flashcards, onAccept, onReject, onEdit }: FlashcardsListProps) {
  return (
    <div className="space-y-4 grid grid-cols-3 gap-4 w-full">
      <AnimatePresence>
        {flashcards.map((flashcard, index) => (
          <FlashcardItem
            key={index}
            {...flashcard}
            index={index}
            onAccept={() => onAccept(flashcard)}
            onReject={() => onReject(flashcard)}
            onEdit={editedFlashcard => onEdit(flashcard, editedFlashcard)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
