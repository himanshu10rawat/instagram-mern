import { Worker } from "bullmq";

import { createRedisClient } from "../config/redis.js";
import transporter from "../config/email.js";

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
    const { to, subject, html, text } = job.data;
    const startedAt = Date.now();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    console.log(`Email sent to ${to} in ${Date.now() - startedAt}ms`, {
      messageId: info.messageId,
    });
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
