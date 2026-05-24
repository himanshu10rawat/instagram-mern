import transporter from "../config/email.js";

const BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

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
const BREVO_API_TIMEOUT_MS = getPositiveNumber(process.env.BREVO_API_TIMEOUT_MS, 10000);

const getTrimmedEnv = (name) => process.env[name]?.trim();

const parseEmailAddress = (address) => {
  const normalizedAddress = String(address || "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .trim();
  const addressMatch = normalizedAddress.match(/^(.*?)\s*<([^<>]+)>$/);

  if (!addressMatch) {
    return { email: normalizedAddress };
  }

  const name = addressMatch[1].replace(/^"|"$/g, "").trim();

  return {
    email: addressMatch[2].trim(),
    ...(name ? { name } : {}),
  };
};

const normalizeRecipients = (to) => {
  const recipients = Array.isArray(to) ? to : String(to || "").split(",");

  return recipients
    .map(parseEmailAddress)
    .filter((recipient) => recipient.email);
};

const shouldUseBrevoApi = () => {
  return (
    process.env.EMAIL_PROVIDER?.trim().toLowerCase() === "brevo" &&
    Boolean(getTrimmedEnv("BREVO_API_KEY"))
  );
};

const sendEmailWithSmtp = async ({ to, subject, html, text }) => {
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
    provider: "smtp",
  });

  return info;
};

const sendEmailWithBrevoApi = async ({ to, subject, html, text }) => {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BREVO_API_TIMEOUT_MS);
  const body = {
    sender: parseEmailAddress(process.env.EMAIL_FROM),
    to: normalizeRecipients(to),
    subject,
    ...(html ? { htmlContent: html } : { textContent: text }),
  };

  try {
    const response = await fetch(BREVO_SEND_EMAIL_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": getTrimmedEnv("BREVO_API_KEY"),
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        responseBody.message || `Brevo email API failed with status ${response.status}`,
      );
    }

    console.log(`Email sent to ${to} in ${Date.now() - startedAt}ms`, {
      messageId: responseBody.messageId,
      provider: "brevo-api",
    });

    return responseBody;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Brevo email API request timed out", { cause: error });
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const sendEmailOnce = async (data) => {
  if (shouldUseBrevoApi()) {
    return sendEmailWithBrevoApi(data);
  }

  return sendEmailWithSmtp(data);
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
