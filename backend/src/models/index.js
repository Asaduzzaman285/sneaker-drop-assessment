const sequelize = require("../config/database");

const User = require("./User");
const Drop = require("./Drop");
const Reservation = require("./Reservation");
const Purchase = require("./Purchase");

// User ↔ Reservation
User.hasMany(Reservation, { foreignKey: "user_id" });
Reservation.belongsTo(User, { foreignKey: "user_id" });

// Drop ↔ Reservation
Drop.hasMany(Reservation, { foreignKey: "drop_id" });
Reservation.belongsTo(Drop, { foreignKey: "drop_id" });

// User ↔ Purchase
User.hasMany(Purchase, { foreignKey: "user_id" });
Purchase.belongsTo(User, { foreignKey: "user_id" });

// Drop ↔ Purchase
Drop.hasMany(Purchase, { foreignKey: "drop_id" });
Purchase.belongsTo(Drop, { foreignKey: "drop_id" });

module.exports = {
  sequelize,
  User,
  Drop,
  Reservation,
  Purchase,
};
