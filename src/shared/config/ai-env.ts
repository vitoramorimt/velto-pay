import "server-only";

import { z } from "zod";

const aiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4.1-mini"),
});

export type AiEnv = z.infer<typeof aiEnvSchema>;

export const aiEnv: AiEnv = aiEnvSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
  OPENAI_MODEL: process.env.OPENAI_MODEL || undefined,
});
