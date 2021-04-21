const sequelize = require("../server/db_config/config_local");
const Sequelize = require("sequelize");
const Joi = require("joi");

const ClientOru = sequelize.sequelize.define(
    "clients_oru", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        f_name: Sequelize.STRING,
        m_name: Sequelize.STRING,
        l_name: Sequelize.STRING,
        clinic_number: {
            type: Sequelize.NUMBER,
            unique: true,
            allowNull: false,
            len: 10
        },
        mfl_code: {
            type: Sequelize.INTEGER,
            len: 5
        },
        gods_number: Sequelize.STRING,
        sending_application: Sequelize.STRING,
        observation_value: Sequelize.STRING,
        observation_datetime: Sequelize.DATE,
        processed: Sequelize.STRING,
        date_processed: Sequelize.DATEONLY,
        message_type: Sequelize.STRING,
        send_log: Sequelize.STRING
        
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        tableName: "clients_oru"
    }
);

function validateClientOru(client) {
    const schema = {
        group_id: Joi.number(),
        mfl_code: Joi.number()
            .min(5)
            .max(5),
        clinic_number: Joi.number()
            .min(10)
            .max(10),
    };

    return Joi.validate(client, schema);
}
exports.ClientOru = ClientOru;
exports.validateClientOru = validateClientOru;