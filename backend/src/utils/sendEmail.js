import transporter from "../config/email.js";

const getPositiveNumber = (value, fallback) => {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
};

const wait = (delayMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const DEFAULT_EMAIL_SEND_ATTEMPTS = getPositiveNumber(process.env.EMAIL_SEND_ATTEMPTS, 2);
const DEFAULT_EMAIL_SEND_RETRY_DELAY_MS = getPositiveNumber(
  process.env.EMAIL_SEND_RETRY_DELAY_MS,
  1000,
);

const sendEmailOnce = async ({ to, subject, html, text }) => {
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

  return info;
};

export const sendEmail = async (
  data,
  {
    attempts = DEFAULT_EMAIL_SEND_ATTEMPTS,
    retryDelayMs = DEFAULT_EMAIL_SEND_RETRY_DELAY_MS,
  } = {},
) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await sendEmailOnce(data);
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        console.warn(`Email send attempt ${attempt} failed; retrying:`, error.message);
        await wait(retryDelayMs);
      }
    }
  }

  throw lastError;
};
