const express = require("express");
const router = express.Router();

const { Drop, Purchase, User } = require("../models");

/**
 * CREATE A NEW MERCH DROP
 * POST /api/drops
 */
router.post("/", async (req, res) => {
  try {
    const { name, price, total_stock, starts_at } = req.body;

    if (!name || !price || !total_stock || !starts_at) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const drop = await Drop.create({
      name,
      price,
      total_stock,
      available_stock: total_stock,
      starts_at,
    });

    res.status(201).json(drop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create drop" });
  }
});

/**
 * LIST DROPS WITH TOP 3 RECENT PURCHASERS
 * GET /api/drops
 */
router.get("/", async (req, res) => {
  try {
    const drops = await Drop.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Purchase,
          limit: 3,
          separate: true, // IMPORTANT: prevents wrong SQL
          order: [["created_at", "DESC"]],
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
      ],
    });

    const response = drops.map((drop) => ({
      id: drop.id,
      name: drop.name,
      price: drop.price,
      total_stock: drop.total_stock,
      available_stock: drop.available_stock,
      starts_at: drop.starts_at,
      recent_purchasers: drop.Purchases.map(
        (purchase) => purchase.User.username
      ),
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch drops" });
  }
});

module.exports = router;
