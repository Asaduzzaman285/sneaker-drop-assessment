require("dotenv").config();
const app = require("./app"); // your express app
const { sequelize } = require("./models");
const http = require("http");

const PORT = process.env.PORT || 4000;

// Create server
const server = http.createServer(app);

// Socket.io setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for now
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
      await sequelize.authenticate();
      console.log("✅ Database connected");
      await sequelize.sync({ alter: true });
      console.log("✅ Database synced");
      isDbConnected = true;
    } catch (error) {
      console.error("❌ Startup error:", error);
    }
  }
}

// Start worker loop only if not in serverless (mostly for local) or try to run it
// Note: setInteval expires in Vercel. We need a cron job for production really.
if (require.main === module) {
  (async () => {
    await startServer();
    setInterval(() => expireReservations(app), 5 * 1000); // 5 sec interval
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })();
} else {
  // For Vercel: We need to connect to DB on request if not connected
  // But we can't await in top level. 
  // We export the handler.
  // Ideally we wrap app to ensure DB is connected?
  startServer();
  // Worker won't run reliably on Vercel functions due to freeze. 
  // Ideally use Vercel Cron.
}

module.exports = app;
