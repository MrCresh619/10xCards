import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FlashcardFormValues } from "@/lib/validations/flashcard";
import { flashcardFormSchema } from "@/lib/validations/flashcard";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface FlashcardFormProps {
  initialValues?: Partial<FlashcardFormValues>;
  onSubmit: (values: FlashcardFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function FlashcardForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FlashcardFormProps) {
  const form = useForm<FlashcardFormValues>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      front: initialValues?.front ?? "",
      back: initialValues?.back ?? "",
      source: initialValues?.source ?? "manual",
      generated_id: initialValues?.generated_id,
    } as FlashcardFormValues,
  });

  const handleSubmit = form.handleSubmit(async (values: FlashcardFormValues) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      // Błędy są obsługiwane przez komponent nadrzędny
      console.error("Błąd podczas zapisywania fiszki:", error);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="front"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Przód fiszki (pytanie)</FormLabel>
              <FormControl>
                <Textarea placeholder="Wprowadź pytanie..." className="min-h-[100px]" {...field} />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right mt-1">
                {field.value.length}/200 znaków
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="back"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tył fiszki (odpowiedź)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Wprowadź odpowiedź..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right mt-1">
                {field.value.length}/500 znaków
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
