import { z } from "zod";

export const mazeChaseAnswerSchema = z.object({
  text: z.string().min(1, "Answer cannot be empty"),
  isCorrect: z.boolean(),
});

export const mazeChaseQuestionSchema = z.object({
  questionText: z.string().min(3, "Question text too short"),
  questionImages: z.union([z.instanceof(File), z.null()]),
  answers: z
    .array(mazeChaseAnswerSchema)
    .length(4, "Each question must have 4 answers")
    .refine(
      (answers) => answers.some((a) => a.isCorrect),
      "At least one answer must be correct on each question",
    ),
});

export const mazeChaseSchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().min(5, "Description too short"),
  thumbnail: z.instanceof(File),
  mapId: z.string().min(1, "Map ID is required"),
  questions: z
    .array(mazeChaseQuestionSchema)
    .min(1, "At least one question required")
    .max(20, "Maximum 20 questions allowed"),
  settings: z.object({
    isQuestionRandomized: z.boolean(),
    isAnswerRandomized: z.boolean(),
    countdownMinutes: z.number().min(1, "Countdown must be at least 1 minute").max(60, "Countdown cannot exceed 60 minutes"),
  }),
});

export type MazeChaseForm = z.infer<typeof mazeChaseSchema>;
