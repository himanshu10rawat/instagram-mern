import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import { cleanupOrphanedDatabaseData } from "../utils/orphanCleanup.js";

const run = async () => {
  try {
    await connectDB();

    const result = await cleanupOrphanedDatabaseData();

    console.log("Orphan cleanup completed");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Orphan cleanup failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
