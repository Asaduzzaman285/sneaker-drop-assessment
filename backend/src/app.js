const express = require("express");
const cors = require("cors");

const dropRoutes = require("./routes/drop.routes");
const reservationRoutes = require("./routes/reservation.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const app = express();

app.use(cors());
app.use(express.json());


app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Routes
app.use("/api/drops", dropRoutes);
app.use("/api", reservationRoutes);
app.use("/api/purchase", purchaseRoutes);
module.exports = app;
