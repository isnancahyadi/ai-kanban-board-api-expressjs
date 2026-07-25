import type { Application } from "express";
import swaggerUi from "swagger-ui-express";

export const setupSwagger = async (app: Application) => {
  try {
    const swaggerFile = Bun.file("src/docs/swagger-output.json");
    const swaggerDocument = await swaggerFile.json();

    app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log("📝 Swagger docs available at http://localhost:5050/api/v1/docs");
  } catch (error) {
    console.error(
      "❌ Failed to load Swagger UI. Ensure the swagger-output.json file exists.",
      error,
    );
  }
};
