const { completePurchase } = require("../services/purchase.service");

async function purchaseController(req, res) {
  const user_id = req.body.user_id;
  const drop_id = parseInt(req.params.id);

  try {
    const result = await completePurchase(user_id, drop_id,req.app);
    if (!result.success) {
      if (result.message === "RESERVATION_NOT_FOUND") {
        return res.status(404).json({ message: "Reservation not found" });
      }
      if (result.message === "RESERVATION_EXPIRED") {
        return res.status(410).json({ message: "Reservation expired" });
      }
      return res.status(500).json({ message: "Purchase failed" });
    }
    return res.status(200).json({
      message: "Purchase completed",
      reservation: result.reservation
    });
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({ message: "Purchase failed" });
  }
}

module.exports = { purchaseController };
