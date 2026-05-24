const LOCAL_DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

const parseOrigins = (value) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) || [];

export const getAllowedOrigins = () => {
  const configuredOrigins = [
    ...parseOrigins(process.env.CLIENT_URL),
    ...parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
  ];

  const origins =
    process.env.NODE_ENV === "production"
      ? configuredOrigins
      : [...configuredOrigins, ...LOCAL_DEV_ORIGINS];

  return [...new Set(origins)];
};

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || getAllowedOrigins().includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};
