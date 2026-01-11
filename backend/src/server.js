require("dotenv").config();
const app = require("./app"); // your express app
const { sequelize } = require("./models");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;

// Create server - this is used for local development
const server = http.createServer(app);
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

// Local Development Server
if (require.main === module) {
  (async () => {
    await startServer();
    const allowedOrigins = ["https://sneaker-drop-front-end.vercel.app","http://localhost:5173"];
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
      },
    });
    app.set("io", io);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      expireReservations(app);
      setInterval(() => expireReservations(app), 30 * 1000);
    });
  })();
} else {
  // Vercel Serverless Entry Point
  module.exports = async (req, res) => {
    await startServer();

    if (!res.socket.server.io) {
      console.log("First request, attaching socket.io...");
      const io = new Server(res.socket.server, {
        path: "/socket.io",
        cors: {
          origin: ["https://sneaker-drop-front-end.vercel.app", "http://localhost:5173"],
          methods: ["GET", "POST"],
        },
      });
      res.socket.server.io = io;
      app.set("io", io);
    }
    
    return app(req, res);
  };
}
