const sequelize = require("../dbconnection");
const Sequelize = require("sequelize");
const Joi = require("joi");
const User = sequelize.sequelize.define(
  "users",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: Sequelize.STRING,
    status: Sequelize.ENUM("Active", "Disabled"),
    password: Sequelize.TEXT,
   
  },
  {
    timestamps: true,
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    tableName: "tbl_users"
  }
);

function validateUser(user) {
  const schema = {
    f_name: Joi.string()
      .min(3)
      .max(10)
      .required(),
    password: Joi.string()
      .min(4)
      .max(255),
  };

  return Joi.validate(user, schema);
}
exports.User = User;
exports.validateUser = validateUser;
