const { completePurchase } = require("../services/purchase.service");

async function purchaseController(req, res) {
  const user_id = req.body.user_id;
  const drop_id = parseInt(req.params.id);

  try {
    const result = await completePurchase(user_id, drop_id,req.app);
    if (result.success) return res.status(200).json(result);
    return res.status(400).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { purchaseController };
