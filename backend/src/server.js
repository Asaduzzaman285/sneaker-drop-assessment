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
setInterval(() => expireReservations(app), 1 * 1000);

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("⚡ Client disconnected:", socket.id);
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup error:", error);
  }
})();
