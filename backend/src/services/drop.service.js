const { Drop, Reservation, User } = require("../models");

async function getDropsWithRecentPurchasers() {
  const drops = await Drop.findAll({
    order: [["starts_at", "DESC"]],
    include: [
      {
        model: Reservation,
        where: { status: "COMPLETED" },
        required: false, // show drops even if no purchase yet
        include: [
          {
            model: User,
            attributes: ["id", "username"],
          },
        ],
        limit: 3, // only 3 recent purchases per drop
        order: [["created_at", "DESC"]],
      },
    ],
  });

  // Format response
  return drops.map(drop => ({
    id: drop.id,
    name: drop.name,
    price: drop.price,
    total_stock: drop.total_stock,
    available_stock: drop.available_stock,
    starts_at: drop.starts_at,
    recentPurchasers: drop.Reservations.map(r => ({
      id: r.User.id,
      username: r.User.username,
      purchased_at: r.created_at,
    })),
  }));
}

module.exports = { getDropsWithRecentPurchasers };
