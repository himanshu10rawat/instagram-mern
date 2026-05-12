import { Queue } from "bullmq";

import { createRedisClient } from "../config/redis.js";

const connection = createRedisClient({
  maxRetriesPerRequest: null,
});

let emailQueue;

export const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue("email-queue", {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }

  return emailQueue;
};

export const addEmailJob = async (data) => {
  await getEmailQueue().add("send-email", data);
};
