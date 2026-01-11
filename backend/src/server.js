require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");
const http = require("http");
const { initSocket } = require("./sockets/socket");
const expireReservations = require("./workers/expireReservations");

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Database & Server Startup Logic
let isDbConnected = false;

async function startServer() {
  if (isDbConnected) return;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is missing!");
    }

    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    const enableSync = process.env.DB_SYNC === 'true';
    if (enableSync) {
      await sequelize.sync({ alter: true });
      console.log("✅ Database schema synced.");
    } else {
      console.log("ℹ️ Skipping database sync (DB_SYNC is not 'true').");
    }

    isDbConnected = true;
  } catch (error) {
    console.error("❌ Database connection or sync failed:", error);
    // Exit gracefully if DB connection fails, as the app is unusable.
    process.exit(1);
  }
}

// --- Entry Points ---

// Local/Docker Development Entry Point
if (require.main === module) {
  (async () => {
    await startServer();

    // Initialize Socket.IO and attach it to the server
    initSocket(server);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (local/docker mode)`);
      
      // Start the reservation expiration worker for the local environment
      console.log("🕒 Starting reservation expiration worker (runs every 15 seconds)...");
      setInterval(() => {
        console.log("Running scheduled job: expireReservations");
        expireReservations();
      }, 15000); // run every 15 seconds
    });
  })();
}
// Vercel Serverless Entry Point
else {
  module.exports = async (req, res) => {
    // For serverless, we only need to ensure the DB is ready on each invocation.
    // The cron job will handle expirations separately.
    await startServer();
    return app(req, res);
  };
}
