import { Worker } from "bullmq";

import { createRedisClient } from "../config/redis.js";
import transporter from "../config/email.js";

const connection = createRedisClient({
  maxRetriesPerRequest: null,
});

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { to, subject, html, text } = job.data;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    console.log(`Email sent to ${to}`);
  },
  {
    connection,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Email job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Email job failed: ${job?.id}`, error.message);
});
