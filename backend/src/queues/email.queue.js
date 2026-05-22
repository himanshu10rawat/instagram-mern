import { Queue } from "bullmq";

import { createRedisClient } from "../config/redis.js";

const connection = createRedisClient({
  enableOfflineQueue: false,
  maxRetriesPerRequest: null,
});

const getPositiveNumber = (value, fallback) => {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
};

const EMAIL_JOB_ATTEMPTS = getPositiveNumber(process.env.EMAIL_JOB_ATTEMPTS, 2);
const EMAIL_JOB_BACKOFF_MS = getPositiveNumber(process.env.EMAIL_JOB_BACKOFF_MS, 1000);
const EMAIL_JOB_PRIORITY = getPositiveNumber(process.env.EMAIL_JOB_PRIORITY, 1);

let emailQueue;

export const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue("email-queue", {
      connection,
      defaultJobOptions: {
        attempts: EMAIL_JOB_ATTEMPTS,
        backoff: {
          type: "fixed",
          delay: EMAIL_JOB_BACKOFF_MS,
        },
        removeOnComplete: {
          age: 60 * 60,
          count: 1000,
        },
        removeOnFail: {
          age: 24 * 60 * 60,
          count: 1000,
        },
      },
    });
  }

  return emailQueue;
};

export const addEmailJob = async (data, options = {}) => {
  await getEmailQueue().add("send-email", data, {
    priority: options.priority || EMAIL_JOB_PRIORITY,
  });
};
