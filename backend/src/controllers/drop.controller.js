const { getDropsWithRecentPurchasers } = require("../services/drop.service");

async function getDropsController(req, res) {
  try {
    const drops = await getDropsWithRecentPurchasers();
    res.status(200).json(drops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch drops" });
  }
}

module.exports = { getDropsController };
