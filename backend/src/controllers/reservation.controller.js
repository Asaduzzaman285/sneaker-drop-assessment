const { reserveItem } = require("../services/reservation.service");

async function reserveItemController(req, res) {
  try {
    const dropId = req.params.id;
    const userId = req.body.userId || req.body.user_id;

    if (!userId) {
      return res.status(400).json({ message: "user_id or userId is required" });
    }

    const result = await reserveItem(userId, dropId,req.app);

    if (!result.success) {
      if (result.message === "OUT_OF_STOCK") {
        return res.status(409).json({ message: "Out of stock" });
      }
      if (result.message === "DROP_NOT_FOUND") {
        return res.status(404).json({ message: "Drop not found" });
      }
      if (result.message === "ALREADY_RESERVED") {
        return res.status(409).json({ message: "Already reserved" });
      }
      return res.status(500).json({ message: "Reservation failed" });
    }

    // ✅ Successful reservation
    return res.status(201).json({
      message: "Reservation successful",
      reservation: result.reservation,
      available_stock: result.availableStock
    });

  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({ message: "Reservation failed" });
  }
}

module.exports = { reserveItemController };
