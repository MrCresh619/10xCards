import { z } from "zod";

export const flashcardFormSchema = z.discriminatedUnion("source", [
  z.object({
    front: z
      .string()
      .min(3, { message: "Pytanie musi zawierać co najmniej 3 znaki" })
      .max(200, { message: "Pytanie nie może przekraczać 200 znaków" }),
    back: z
      .string()
      .min(3, { message: "Odpowiedź musi zawierać co najmniej 3 znaki" })
      .max(500, { message: "Odpowiedź nie może przekraczać 500 znaków" }),
    source: z.literal("manual"),
    generated_id: z.undefined().optional(),
  }),
  z.object({
    front: z
      .string()
      .min(3, { message: "Pytanie musi zawierać co najmniej 3 znaki" })
      .max(200, { message: "Pytanie nie może przekraczać 200 znaków" }),
    back: z
      .string()
      .min(3, { message: "Odpowiedź musi zawierać co najmniej 3 znaki" })
      .max(500, { message: "Odpowiedź nie może przekraczać 500 znaków" }),
    source: z.enum(["ai-full", "ai-edited"] as const),
    generated_id: z.number(),
  }),
]);

export type FlashcardFormValues = z.infer<typeof flashcardFormSchema>;
