import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Användarnamnet måste vara minst 3 tecken.")
    .max(32, "Användarnamnet är för långt."),
  password: z
    .string()
    .min(8, "Lösenordet måste vara minst 8 tecken.")
    .max(128, "Lösenordet är för långt."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
