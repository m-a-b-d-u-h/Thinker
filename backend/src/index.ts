import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connected");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
