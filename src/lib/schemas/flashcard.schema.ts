import { z } from "zod";
import type { FlashcardSource } from "../../types";

export const flashcardSourceEnum = z.enum(["manual", "ai-full", "ai-edited"] as const satisfies readonly FlashcardSource[]);

// Schemat dla ręcznie tworzonych fiszek
const manualFlashcardSchema = z.object({
  front: z.string().min(3).max(200),
  back: z.string().min(3).max(500),
  source: z.literal("manual"),
  generated_id: z.never().optional(),
});

// Schemat dla fiszek generowanych przez AI
const aiFlashcardSchema = z.object({
  front: z.string().min(3).max(200),
  back: z.string().min(3).max(500),
  source: z.enum(["ai-full", "ai-edited"]),
  generated_id: z.number(),
});

export const flashcardSchema = z.discriminatedUnion("source", [
  manualFlashcardSchema,
  aiFlashcardSchema,
]);

export const flashcardUpdateSchema = z.object({
  front: z.string().min(3).max(200).optional(),
  back: z.string().min(3).max(500).optional(),
  source: z.enum(["manual", "ai-edited"] as const).optional(),
  generated_id: z.number().optional(),
});

export const flashcardQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sort: z.enum(["created_at", "-created_at"]).default("-created_at"),
});

export type FlashcardInput = z.infer<typeof flashcardSchema>;
export type FlashcardUpdateInput = z.infer<typeof flashcardUpdateSchema>;
export type FlashcardQueryParams = z.infer<typeof flashcardQuerySchema>; 