import app from "./app";
import { initSocket } from "./socket";

const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Runtime: Bun v${Bun.version}`);
});

initSocket(server);

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
