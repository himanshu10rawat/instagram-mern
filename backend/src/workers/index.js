import "dotenv/config";

import { validateEnv } from "../config/env.js";

validateEnv();

await Promise.all([import("./email.worker.js"), import("./media.worker.js")]);

console.log("Background workers started");
