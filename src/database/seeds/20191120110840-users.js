"use strict";
const bcrypt = require("bcrypt");
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "users",
      [
        {
          name: "Ismael",
          email: "ismaelbarboza@provider.com",
          password_hash: bcrypt.hashSync("123456", 8),
          provider: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: "Lais",
          email: "laisbarboza@provider.com",
          password_hash: bcrypt.hashSync("123456", 8),
          provider: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: "Elza",
          email: "elza@user.com",
          password_hash: bcrypt.hashSync("123456", 8),
          provider: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: "Sergio",
          email: "sergio@user.com",
          password_hash: bcrypt.hashSync("123456", 8),
          provider: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", null, {});
  }
};
