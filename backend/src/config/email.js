import nodemailer from "nodemailer";

const emailProviderDefaults = {
  brevo: {
    host: "smtp-relay.brevo.com",
    port: 587,
  },
};

const getPositiveNumber = (value, fallback) => {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
};

const emailProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
const providerDefaults = emailProviderDefaults[emailProvider] || {};
const smtpHost = process.env.SMTP_HOST || providerDefaults.host;
const smtpPort = Number(process.env.SMTP_PORT || providerDefaults.port) || 587;
const smtpPassword = process.env.SMTP_PASS || process.env.BREVO_SMTP_KEY;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  pool: true,
  maxConnections: getPositiveNumber(process.env.SMTP_POOL_MAX_CONNECTIONS, 3),
  maxMessages: getPositiveNumber(process.env.SMTP_POOL_MAX_MESSAGES, 100),
  connectionTimeout: getPositiveNumber(process.env.SMTP_CONNECTION_TIMEOUT_MS, 10000),
  greetingTimeout: getPositiveNumber(process.env.SMTP_GREETING_TIMEOUT_MS, 10000),
  socketTimeout: getPositiveNumber(process.env.SMTP_SOCKET_TIMEOUT_MS, 20000),
  auth: {
    user: process.env.SMTP_USER,
    pass: smtpPassword,
  },
});

export default transporter;
