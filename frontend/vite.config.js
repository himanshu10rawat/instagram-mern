import { cwd } from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const REQUIRED_PRODUCTION_ENV = ["VITE_API_BASE_URL", "VITE_SOCKET_URL"];
const localUrlPattern = /localhost|127\.0\.0\.1/;

const validateProductionEnv = (mode) => {
  if (mode !== "production") {
    return;
  }

  const env = loadEnv(mode, cwd(), "");
  const missingEnv = REQUIRED_PRODUCTION_ENV.filter((name) => !env[name]);

  if (missingEnv.length) {
    throw new Error(`Missing production frontend env: ${missingEnv.join(", ")}`);
  }

  const localEnv = REQUIRED_PRODUCTION_ENV.filter((name) => localUrlPattern.test(env[name]));

  if (localEnv.length) {
    throw new Error(`Production frontend env cannot point to localhost: ${localEnv.join(", ")}`);
  }
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  validateProductionEnv(mode);

  return {
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1500,
    },
    server: {
      port: 5173,
    },
  };
});
