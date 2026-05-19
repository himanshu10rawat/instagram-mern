import http from "http";
import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import { validateEnv } from "./config/env.js";
import { initSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();

    if (process.env.WORKERS_ENABLED !== "false") {
      await import("./workers/index.js");
    }

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
};

startServer();
