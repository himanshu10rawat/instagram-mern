import { Queue } from "bullmq";

import { createRedisClient } from "../config/redis.js";

const connection = createRedisClient({
  maxRetriesPerRequest: null,
});

let mediaQueue;

export const getMediaQueue = () => {
  if (!mediaQueue) {
    mediaQueue = new Queue("media-queue", {
      connection,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 10000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }

  return mediaQueue;
};

export const addMediaJob = async (data) => {
  await getMediaQueue().add("process-media", data);
};
