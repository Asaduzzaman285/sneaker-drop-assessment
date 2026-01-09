const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Purchase = sequelize.define(
  "Purchase",
  {
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
  },
  {
    tableName: "purchases",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Purchase;
