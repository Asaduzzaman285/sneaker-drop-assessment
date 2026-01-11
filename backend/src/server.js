require("dotenv").config();
const app = require("./app"); // your express app
const { sequelize } = require("./models");
const http = require("http");

const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

// Create server
const server = http.createServer(app);

// Socket.io setup
const { Server } = require("socket.io");
const allowedOrigins = ["https://sneaker-drop-front-end.vercel.app","http://localhost:5173"];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Make io accessible in controllers/services
app.set("io", io);

const expireReservations = require("./workers/expireReservations");

// Database & Server Startup Logic
let isDbConnected = false;

async function startServer() {
  if (!isDbConnected) {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing!");
      }

      await sequelize.authenticate();
      console.log("✅ Database connected");

      // WARNING: Syncing on every request is bad for Vercel/timeouts and can rewrite DB volumes.
      // Only run when explicitly enabled via DB_SYNC=true.
      const enableSync = process.env.DB_SYNC === 'true';
      if (enableSync) {
        await sequelize.sync({ alter: true });
        console.log("✅ Database synced");
      } else {
        console.log("⚠️ Skipping sequelize sync (DB_SYNC !== 'true')");
      }

      isDbConnected = true;
    } catch (error) {
      console.error("❌ Startup error:", error);
      throw error; // Propagate to caller
    }
  }
}

// Start worker loop only if not in serverless (mostly for local) or try to run it
// Note: setInteval expires in Vercel. We need a cron job for production really.
if (require.main === module) {
  (async () => {
    await startServer();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      // Run once immediately to catch up any stale reservations
      expireReservations(app);
      // Run periodically
      setInterval(() => expireReservations(app), 30 * 1000);
    });
  })();
} else {
  // Vercel Serverless Entry Point
  // Vercel Serverless Entry Point
  module.exports = async (req, res) => {
    // 1. Sanity Check (Bypasses DB)
    if (req.url && req.url.includes('/sanity')) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send("Sanity Check OK - Server is Alive");
    }

    try {
      await startServer();
      return app(req, res);
    } catch (error) {
      console.error("Vercel Startup Error:", error);
      res.status(500).json({ error: "Server Startup Failed", details: error.message });
    }
  };
}
