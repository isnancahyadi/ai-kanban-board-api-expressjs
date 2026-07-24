import z from "zod";

export const CreateBoardSchema = z
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

export type CreateBoardInputType = z.infer<typeof CreateBoardSchema>;

export const UpdateBoardSchema = z.object({
  title: z
    .string()
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "Board title may only contain letters, spaces, and special characters like (') and (-)",
    )
    .optional(),
  description: z.string().nullable().optional(),
  color: z.string().optional(),
});

export type UpdateBoardInputType = z.infer<typeof UpdateBoardSchema>;
