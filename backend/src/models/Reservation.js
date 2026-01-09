const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reservation = sequelize.define("Reservation", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  drop_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM("ACTIVE", "EXPIRED", "COMPLETED"),
    allowNull: false,
    defaultValue: "ACTIVE",
  },
}, {
  tableName: "reservations",
  timestamps: true,
  underscored: true,
});

module.exports = Reservation;
