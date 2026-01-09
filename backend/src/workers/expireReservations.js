const { Reservation, Drop } = require("../models");

async function expireReservations(app) {
  const now = new Date();

  try {
    // Find all active but expired reservations
    const expiredReservations = await Reservation.findAll({
      where: {
        status: "ACTIVE",
        expires_at: { [require("sequelize").Op.lt]: now },
      },
    });

    for (const reservation of expiredReservations) {
      // Mark as expired
      reservation.status = "EXPIRED";
      await reservation.save();

      // Increment stock back
      const drop = await Drop.findByPk(reservation.drop_id);
      if (drop) {
        drop.available_stock += 1;
        await drop.save();

        // Broadcast updated stock
        if (app) {
          const io = app.get("io");
          io.emit("stock_update", {
            drop_id: drop.id,
            available_stock: drop.available_stock,
          });
        }
      }
    }

    if (expiredReservations.length > 0) {
      console.log(`⚡ Expired ${expiredReservations.length} reservations`);
    }
  } catch (error) {
    console.error("Error expiring reservations:", error);
  }
}

module.exports = expireReservations;
