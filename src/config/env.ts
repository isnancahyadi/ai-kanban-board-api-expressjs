import z, { ZodError } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  CLIENT_URL: z.string(),
  PORT: z.string(),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.coerce.number(),
  DB_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  GEMINI_API_KEY: z.string(),
  GEMINI_MODEL: z.string(),
});

export type EnvVars = z.infer<typeof EnvSchema>;

let env: EnvVars;

try {
  env = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Missing required values in .env");
    error.issues.forEach((issue) => {
      console.error(` - ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
  } else {
    throw error;
  }
}

export { env };
