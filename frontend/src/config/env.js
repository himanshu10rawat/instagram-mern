const getClientEnv = (name, localFallback) => {
  const value = import.meta.env[name];

  if (value) {
    return value;
  }

  if (import.meta.env.DEV) {
    return localFallback;
  }

  throw new Error(`${name} is required for production builds`);
};

export const env = {
  apiBaseUrl: getClientEnv("VITE_API_BASE_URL", "http://localhost:5000/api/v1"),
  socketUrl: getClientEnv("VITE_SOCKET_URL", "http://localhost:5000"),
};
