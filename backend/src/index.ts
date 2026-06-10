import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./lib/db.js";

async function start() {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
  });
}

start();
