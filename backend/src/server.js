import http from "http";
import "dotenv/config";

import "./workers/index.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

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
