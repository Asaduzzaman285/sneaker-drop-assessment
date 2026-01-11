const { sequelize, Drop, Reservation } = require("../models");
const { getIO } = require('../sockets/socket');

const reserveItem = async (user_id, drop_id) => {
  const t = await sequelize.transaction();

  try {
    const drop = await Drop.findByPk(drop_id, {
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!drop) {
      if (!t.finished) await t.rollback();
      return { success: false, message: "DROP_NOT_FOUND" };
    }

    let existingReservation = await Reservation.findOne({
      where: { user_id, drop_id, status: "ACTIVE" },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (existingReservation && existingReservation.expires_at < new Date()) {
      existingReservation.status = "EXPIRED";
      await existingReservation.save({ transaction: t });
      await drop.increment('available_stock', { by: 1, transaction: t });
      existingReservation = null; // Clear it so we can create a new one
    }

    if (existingReservation) {
      if (!t.finished) await t.rollback();
      return { success: false, message: "ALREADY_RESERVED" };
    }
    
    // Refetch drop to get the most up-to-date stock count after potential expiration
    const currentDrop = await Drop.findByPk(drop_id, { transaction: t, lock: t.LOCK.UPDATE });

    if (currentDrop.available_stock <= 0) {
      if (!t.finished) await t.rollback();
      return { success: false, message: "OUT_OF_STOCK" };
    }

    const reservation = await Reservation.create(
      {
        user_id,
        drop_id,
        status: "ACTIVE",
        expires_at: new Date(Date.now() + 60 * 1000), // 60 sec
      },
      { transaction: t }
    );

    currentDrop.available_stock -= 1;
    await currentDrop.save({ transaction: t });

    await t.commit();

    try {
      const io = getIO();
      io.emit("stock_update", { dropId: currentDrop.id, availableStock: currentDrop.available_stock });
    } catch (socketError) {
      console.error("Socket.IO emit failed, but reservation was successful:", socketError.message);
    }

    return { success: true, reservation, availableStock: currentDrop.available_stock };
  } catch (error) {
    if (t && !t.finished) await t.rollback();
    console.error("Reservation service error:", error);
    return { success: false, message: "RESERVATION_FAILED" };
  }
};

module.exports = { reserveItem };
