import Sequelize from "sequelize";
import mongoose from "mongoose";
import databaseConfig from "../config/database";

import User from "../app/models/User";
import File from "../app/models/File";
import Appointment from "../app/models/Appointment";

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.connection = new Sequelize(databaseConfig);
    this.init();
    this.mongo();
  }

  init() {
    models
      .map(Model => Model.init(this.connection))
      .map(Model => Model.associate && Model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      "mongodb://localhost:27017/gobarber",
      {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true
      }
    );
  }
}

export default new Database();
