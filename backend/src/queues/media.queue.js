import { Queue } from "bullmq";

import { createRedisClient } from "../config/redis.js";

const connection = createRedisClient({
  enableOfflineQueue: false,
  maxRetriesPerRequest: null,
});

let mediaQueue;
let hasLoggedQueueFailure = false;

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
  try {
    await getMediaQueue().add("process-media", data);
    return true;
  } catch (error) {
    if (!hasLoggedQueueFailure) {
      console.warn(
        "Media queue unavailable; continuing without background media processing:",
        error.message,
      );
      hasLoggedQueueFailure = true;
    }

    return false;
  }
};
