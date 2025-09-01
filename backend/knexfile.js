// backend/knexfile.js
require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL || {
      host: "localhost",
      port: 5435,
      user: "your_username",
      password: "your_password",
      database: "bingo_db",
    },
    migrations: {
      directory: "./prisma/migrations",
    },
    seeds: {
      directory: "./prisma/seeds",
    },
  },
};
