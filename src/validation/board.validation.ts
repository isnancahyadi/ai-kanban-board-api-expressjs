import z from "zod";

export const BoardSchema = z
  .object({
    title: z
      .string({
        error: (issue) => (issue.input === undefined ? "Board title is required" : "Invalid input"),
      })
      .regex(
        /^[a-zA-Z\s\-']+$/,
        "Board title may only contain letters, spaces, and special characters like (') and (-)",
      ),
    description: z.nullable(z.string()),
    color: z.string().default("#6366F1"),
  })
  .required({
    title: true,
  });

export type BoardInputType = z.infer<typeof BoardSchema>;
