const baseRequiredEnvVars = [
  "MONGODB_URI",
  "CLIENT_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "ACCESS_TOKEN_EXPIRES_IN",
  "REFRESH_TOKEN_EXPIRES_IN",
];

const productionRequiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "AGORA_APP_ID",
  "AGORA_APP_CERTIFICATE",
  "REDIS_URL",
  "SMTP_USER",
  "EMAIL_FROM",
];

const isPresent = (value) => typeof value === "string" && value.trim().length > 0;

const emailProviderDefaults = {
  brevo: {
    host: "smtp-relay.brevo.com",
    port: 587,
  },
};

const assertUrl = (name) => {
  try {
    new URL(process.env[name]);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
};

export const validateEnv = () => {
  const requiredEnvVars =
    process.env.NODE_ENV === "production"
      ? [...baseRequiredEnvVars, ...productionRequiredEnvVars]
      : baseRequiredEnvVars;

  const missingEnvVars = requiredEnvVars.filter((name) => !isPresent(process.env[name]));
  const emailProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const hasEmailProviderDefaults = Boolean(emailProviderDefaults[emailProvider]);
  const hasSmtpPassword = isPresent(process.env.SMTP_PASS) || isPresent(process.env.BREVO_SMTP_KEY);

  if (process.env.NODE_ENV === "production" && !hasEmailProviderDefaults) {
    if (!isPresent(process.env.SMTP_HOST)) {
      missingEnvVars.push("SMTP_HOST");
    }

    if (!isPresent(process.env.SMTP_PORT)) {
      missingEnvVars.push("SMTP_PORT");
    }
  }

  if (process.env.NODE_ENV === "production" && !hasSmtpPassword) {
    missingEnvVars.push("SMTP_PASS or BREVO_SMTP_KEY");
  }

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }

  assertUrl("CLIENT_URL");

  if (
    process.env.NODE_ENV === "production" &&
    (process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32)
  ) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be at least 32 characters");
  }

};
