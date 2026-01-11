const { sequelize, Drop, Reservation } = require("../models");
const { Op } = require("sequelize");

const reserveItem = async (user_id, drop_id, app) => {
  const t = await sequelize.transaction();

  try {
    // Fetch drop with lock
    const drop = await Drop.findByPk(drop_id, {
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!drop) {
      if (!t.finished) await t.rollback();
      return { success: false, message: "DROP_NOT_FOUND" };
    }
    // Prevent duplicate active reservation for this user/drop
    let existingReservation = await Reservation.findOne({
      where: { user_id, drop_id, status: "ACTIVE" },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    // If there is an existing ACTIVE reservation but it's past expiry, expire it in-transaction
    if (existingReservation && existingReservation.expires_at && existingReservation.expires_at < new Date()) {
      existingReservation.status = "EXPIRED";
      await existingReservation.save({ transaction: t });

      // Restore stock because the old reservation freed a slot
      drop.available_stock += 1;
      await drop.save({ transaction: t });

      existingReservation = null;
    }

    // If after cleanup reservation still exists and is not expired, block duplicate
    if (existingReservation) {
      if (!t.finished) await t.rollback();
      return { success: false, message: "ALREADY_RESERVED" };
    }

    // Check stock after potential cleanup
    if (drop.available_stock <= 0) {
      if (!t.finished) await t.rollback();
      return { success: false, message: "OUT_OF_STOCK" };
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

    return { success: true, reservation, availableStock: drop.available_stock };
  } catch (error) {
    // Only rollback if transaction is still active
    if (t && !t.finished) await t.rollback();
    console.error("Controller error:", error);
    return { success: false, message: "RESERVATION_FAILED" };
  }
};

module.exports = { reserveItem };
