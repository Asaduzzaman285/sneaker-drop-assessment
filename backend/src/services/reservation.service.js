const { sequelize, Drop, Reservation } = require("../models");

const reserveItem = async (user_id, drop_id, app) => {
  const t = await sequelize.transaction();

  try {
    // Fetch drop with lock
    const drop = await Drop.findByPk(drop_id, {
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!drop || drop.available_stock <= 0) {
      if (!t.finished) await t.rollback();
      return { success: false, message: "Out of stock" };
    }

    // Prevent duplicate active reservation
    const existingReservation = await Reservation.findOne({
      where: { user_id, drop_id, status: "ACTIVE" },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (existingReservation) {
      if (!t.finished) await t.rollback();
      return { success: false, message: "Already reserved" };
    }

    // Create reservation
    const reservation = await Reservation.create(
      {
        user_id,
        drop_id,
        status: "ACTIVE",
        expires_at: new Date(Date.now() + 60 * 1000), // 60 sec
      },
      { transaction: t }
    );

    // Decrement available stock
    drop.available_stock -= 1;
    await drop.save({ transaction: t });

    // Commit transaction
    await t.commit();

    // Emit stock update after commit (only if socket.io is available)
    const io = app.get("io");
    if (io) {
      io.emit("stock_update", { drop_id: drop.id, available_stock: drop.available_stock });
    }

    return { success: true, reservation };
  } catch (error) {
    // Only rollback if transaction is still active
    if (t && !t.finished) await t.rollback();
    console.error("Controller error:", error);
    return { success: false, message: "Reservation failed" };
  }
};

module.exports = { reserveItem };
