import { Worker } from "bullmq";

import { createRedisClient } from "../config/redis.js";

const connection = createRedisClient({
  maxRetriesPerRequest: null,
});

export const mediaWorker = new Worker(
  "media-queue",
  async (job) => {
    const { type, publicId, url } = job.data;

    console.log("Media job received:", {
      type,
      publicId,
      url,
    });

    // Future:
    // thumbnail generation
    // video metadata extraction
    // compression logs
    // moderation scan
  },
  {
    connection,
  },
);

mediaWorker.on("completed", (job) => {
  console.log(`Media job completed: ${job.id}`);
});

mediaWorker.on("failed", (job, error) => {
  console.error(`Media job failed: ${job?.id}`, error.message);
});
