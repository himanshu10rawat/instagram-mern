import { Worker } from "bullmq";

import { createRedisClient } from "../config/redis.js";
import { sendEmail } from "../utils/sendEmail.js";

const connection = createRedisClient({
  maxRetriesPerRequest: null,
});

const getPositiveNumber = (value, fallback) => {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
};

const EMAIL_WORKER_CONCURRENCY = getPositiveNumber(process.env.EMAIL_WORKER_CONCURRENCY, 3);

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    await sendEmail(job.data, { attempts: 1 });
  },
  {
    connection,
    concurrency: EMAIL_WORKER_CONCURRENCY,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Email job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Email job failed: ${job?.id}`, error.message);
});
