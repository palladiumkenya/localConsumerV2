const sequelize = require("../server/db_config/config_local");
const Sequelize = require("sequelize");
const Joi = require("joi");

const Logs = sequelize.sequelize.define(
    "logs", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        f_name: Sequelize.STRING,
        l_name: Sequelize.STRING,
        clinic_number: Sequelize.STRING,
        file_no: Sequelize.STRING,
        message_type: Sequelize.STRING,
        sending_application: Sequelize.STRING,
        send_log: Sequelize.STRING
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        tableName: "logs"
    }    

)

exports.Logs = Logs;