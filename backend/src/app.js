const express = require("express");
const cors = require("cors");

const dropRoutes = require("./routes/drop.routes");
const reservationRoutes = require("./routes/reservation.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const app = express();

const allowedOrigins = ["https://sneaker-drop-front-end.vercel.app","http://localhost:5173"];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());


app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Routes
app.use("/api/drops", dropRoutes);
app.use("/api", reservationRoutes);
app.use("/api/purchase", purchaseRoutes);
module.exports = app;
