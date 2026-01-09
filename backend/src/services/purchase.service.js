const { sequelize, Reservation, Purchase, Drop } = require("../models");

const completePurchase = async (user_id, drop_id, app) => {

  const t = await sequelize.transaction();

  try {
    const reservation = await Reservation.findOne({
      where: { user_id, drop_id, status: "ACTIVE" },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!reservation) {
      await t.rollback();
      return { success: false, message: "No active reservation found" };
    }

    // Check reservation expiration
    if (reservation.expires_at && reservation.expires_at < new Date()) {
      await t.rollback();
      return { success: false, message: "Reservation expired" };
    }

    // Complete reservation
    reservation.status = "COMPLETED";
    await reservation.save({ transaction: t });

    // Create purchase
    const purchase = await Purchase.create(
      {
        user_id: reservation.user_id,
        drop_id: reservation.drop_id,
      },
      { transaction: t }
    );

    await t.commit();

    // Fetch User for socket update
    const user = await require("../models").User.findByPk(reservation.user_id);

    // Emit purchase update
    const io = app.get("io");
    io.emit("purchase_update", {
      drop_id: drop_id,
      user: { id: reservation.user_id, username: user ? user.username : "Unknown" },
    });

    return { success: true, message: "Purchase completed", reservation };
  } catch (error) {
    if (t) await t.rollback();
    console.error(error);
    return { success: false, message: "Purchase failed" };
  }
};


module.exports = { completePurchase };
