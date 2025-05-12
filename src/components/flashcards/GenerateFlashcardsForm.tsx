import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFlashcardGeneration } from "@/components/hooks/useFlashcardGeneration";
import { useFlashcardsSave } from "@/components/hooks/useFlashcardsSave";
import { GeneratedFlashcardsList } from "./GeneratedFlashcardsList";
import { Spinner } from "@/components/ui/spinner";
import type { FlashcardProposalDTO } from "@/types";
import { toast } from "sonner";
import { AnimatedList } from "./AnimatedList";
import { motion } from "framer-motion";

export function GenerateFlashcardsForm() {
  const [sourceText, setSourceText] = useState("");
  const { generateFlashcards, isLoading, error, generatedFlashcards } = useFlashcardGeneration();
  const { saveFlashcards, isSaving, error: saveError } = useFlashcardsSave();
  const [acceptedFlashcards, setAcceptedFlashcards] = useState<FlashcardProposalDTO[]>([]);
  const [editedFlashcards, setEditedFlashcards] = useState<FlashcardProposalDTO[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await generateFlashcards({ source_text: sourceText });
    if (result) {
      setAcceptedFlashcards([]);
      setEditedFlashcards([]);
    }
  };

  const handleAccept = (flashcard: FlashcardProposalDTO) => {
    setAcceptedFlashcards(prev => [...prev, flashcard]);
  };

  const handleReject = (flashcard: FlashcardProposalDTO) => {
    setAcceptedFlashcards(prev => prev.filter(f => f !== flashcard));
  };

  const handleEdit = (
    originalFlashcard: FlashcardProposalDTO,
    editedFlashcard: FlashcardProposalDTO
  ) => {
    setEditedFlashcards(prev => {
      const filtered = prev.filter(
        f => f.front !== originalFlashcard.front || f.back !== originalFlashcard.back
      );
      return [...filtered, editedFlashcard];
    });
  };

  const displayedFlashcards = generatedFlashcards
    ? generatedFlashcards.flashcards_proposals.map(flashcard => {
        const editedVersion = editedFlashcards.find(
          f => f.front === flashcard.front || f.back === flashcard.back
        );
        return editedVersion || flashcard;
      })
    : [];

  const handleSaveAll = async () => {
    if (!generatedFlashcards) return;

    const result = await saveFlashcards(displayedFlashcards, generatedFlashcards.generation_id);

    if (result) {
      if (result.failed.length > 0) {
        toast.warning("Zapisano fiszki częściowo", {
          description: `Zapisano ${result.data.length} fiszek. ${result.failed.length} fiszek nie udało się zapisać.`,
        });
      } else {
        toast.success("Zapisano fiszki", {
          description: `Pomyślnie zapisano ${result.data.length} fiszek.`,
        });
      }
    } else if (saveError) {
      toast.error("Błąd zapisu", {
        description: saveError,
      });
    }
  };

  const handleSaveAccepted = async () => {
    if (!generatedFlashcards || acceptedFlashcards.length === 0) return;

    const result = await saveFlashcards(acceptedFlashcards, generatedFlashcards.generation_id);

    if (result) {
      if (result.failed.length > 0) {
        toast.warning("Zapisano fiszki częściowo", {
          description: `Zapisano ${result.data.length} fiszek. ${result.failed.length} fiszek nie udało się zapisać.`,
        });
      } else {
        toast.success("Zapisano fiszki", {
          description: `Pomyślnie zapisano ${result.data.length} fiszek.`,
        });
      }
    } else if (saveError) {
      toast.error("Błąd zapisu", {
        description: saveError,
      });
    }
  };

  const isValid = sourceText.length >= 1000 && sourceText.length <= 10000;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Wprowadź tekst do przetworzenia</CardTitle>
          <CardDescription>
            Wprowadź tekst o długości od 1000 do 10000 znaków, z którego zostaną wygenerowane
            fiszki.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Wprowadź tekst źródłowy..."
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                className="min-h-[200px]"
                disabled={isLoading}
              />
              <div className="text-sm text-muted-foreground">
                Liczba znaków: {sourceText.length} / 10000
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              {saveError && <div className="text-sm text-destructive">{saveError}</div>}
            </div>
            <Button type="submit" disabled={!isValid || isLoading} className="w-full">
              {isLoading ? "Generowanie..." : "Generuj fiszki"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatedList show={isLoading || isSaving}>
        <div className="flex justify-center">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Spinner size="lg" />
          </motion.div>
        </div>
      </AnimatedList>

      {generatedFlashcards && (
        <AnimatedList show={true}>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-2xl font-bold">Wygenerowane fiszki</h2>
              <div className="space-x-2 self-end">
                <Button
                  variant="outline"
                  onClick={handleSaveAll}
                  disabled={displayedFlashcards.length === 0 || isLoading || isSaving}
                >
                  {isSaving ? "Zapisywanie..." : "Zapisz wszystkie"}
                </Button>
                <Button
                  variant="default"
                  onClick={handleSaveAccepted}
                  disabled={acceptedFlashcards.length === 0 || isLoading || isSaving}
                >
                  {isSaving
                    ? "Zapisywanie..."
                    : `Zapisz zaakceptowane (${acceptedFlashcards.length})`}
                </Button>
              </div>
            </motion.div>

            <GeneratedFlashcardsList
              flashcards={displayedFlashcards}
              onAccept={handleAccept}
              onReject={handleReject}
              onEdit={handleEdit}
            />
          </div>
        </AnimatedList>
      )}
    </div>
  );
}
