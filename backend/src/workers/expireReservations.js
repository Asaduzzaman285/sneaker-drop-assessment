const { Op } = require('sequelize');
const { Reservation, Drop } = require('../models');
const { getIO } = require('../sockets/socket');

const expireReservations = async () => {
  const now = new Date();

  try {
    // Find all active but expired reservations, including the associated drop
    const expiredReservations = await Reservation.findAll({
      where: {
        status: 'ACTIVE',
        expires_at: { [Op.lt]: now },
      },
      include: [{ model: Drop }],
    });

    if (expiredReservations.length === 0) {
      return; // No work to do
    }

    const io = getIO();

    for (const reservation of expiredReservations) {
      const drop = reservation.Drop;
      if (!drop) continue; // Should not happen due to FK constraints, but good practice

      // Use a transaction to ensure atomicity
      await reservation.sequelize.transaction(async (t) => {
        // Mark reservation as expired
        reservation.status = 'EXPIRED';
        await reservation.save({ transaction: t });

        // Increment stock back
        await drop.increment('available_stock', { by: 1, transaction: t });
      });

      // Broadcast the updated stock. The stock has been incremented by 1.
      io.emit('stock_update', {
        dropId: drop.id,
        availableStock: drop.available_stock + 1,
      });
    }

    if (expiredReservations.length > 0) {
        console.log(`⚡ Expired ${expiredReservations.length} reservations and restored stock.`);
    }
  } catch (error) {
    console.error('Error expiring reservations:', error);
  }
};

module.exports = expireReservations;
