const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === 'production';

console.log(`🛠 Database Config: NODE_ENV=${process.env.NODE_ENV}, SSL=${isProduction}`);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectModule: require('pg'), // Required for Vercel/Webpack to detect the dependency
  logging: false,
  dialectOptions: isProduction
    ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
    : {},
});

module.exports = sequelize;
