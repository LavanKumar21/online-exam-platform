// ✅ entry point (starts workers)
require("dotenv").config();
const express = require("express");
const app = express();
const { connectDB, pool } = require("./src/config/db");
// Import redis connection
const { redisConnection } = require("./src/config/redis");

let workerStarted = false;

const workerServices=async () => {
    
    try {
        await connectDB();

        // Start exam worker
         // ✅ Start workers AFTER DB is ready
    require("./src/workers/exam.worker");
    require("./src/workers/submission.worker");
    

    workerStarted = true;

    console.log("✅ Worker service is running...");
    } catch (error) {
        console.error("❌ Error starting worker service:", error);
         process.exit(1);
    }
}

// start everything
workerServices();

// 🛑 Graceful Shutdown (VERY IMPORTANT)
const shutdown = async () => {
  console.log("🛑 Shutting down worker service...");

  try {
    // Close Redis connection
    if (workersStarted) {
      await redisConnection.quit();
      console.log("✅ Redis connection closed");
    }

    // Close DB pool
    await pool.end();
    console.log("✅ DB connection pool closed");

    console.log("👋 Shutdown complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

// Listen for shutdown signals
process.on("SIGINT", shutdown);   // Ctrl + C
process.on("SIGTERM", shutdown);  // Cloud platforms


// 💥 Handle unexpected errors (prevent crash)
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
});


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: Date.now()
  });
});

app.listen(process.env.PORT || 4005, () => {
  console.log(`Submission Worker is running on port ${process.env.PORT || 4005}`);
});