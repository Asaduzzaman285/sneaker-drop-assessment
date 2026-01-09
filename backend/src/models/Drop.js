const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Drop = sequelize.define("Drop", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER, // store in cents
    allowNull: false,
  },
  total_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  available_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  starts_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "drops",
  timestamps: true,
  underscored: true,
});

module.exports = Drop;
