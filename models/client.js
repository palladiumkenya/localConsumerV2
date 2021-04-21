const sequelize = require("../dbconnection");
const Sequelize = require("sequelize");
const Joi = require("joi");

const Client = sequelize.sequelize.define(
    "clients", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        f_name: Sequelize.STRING,
        m_name: Sequelize.STRING,
        l_name: Sequelize.STRING,
        dob: Sequelize.DATEONLY,
        clinic_number: {
            type: Sequelize.NUMBER,
            unique: true,
            allowNull: false,
            len: 10
        },
        patient_clinic_number: Sequelize.STRING,
        mfl_code: {
            type: Sequelize.INTEGER,
            len: 5
        },
        gender: Sequelize.NUMBER,
        marital: Sequelize.NUMBER,
        phone_no: Sequelize.STRING,
        GODS_NUMBER: Sequelize.STRING,
        group_id: Sequelize.INTEGER,
        SENDING_APPLICATION: Sequelize.STRING,
        db_source: Sequelize.STRING,
        PATIENT_SOURCE: Sequelize.STRING,
        enrollment_date: Sequelize.DATEONLY,
        art_date: {
            type: Sequelize.DATEONLY,
            defaultValue: null,
            allowNull: true
        },
        client_type: Sequelize.STRING,
        processed: Sequelize.STRING,
        date_processed: Sequelize.DATE,
        status: Sequelize.ENUM(
            "Active",
            "Disabled",
            "Deceased",
            "Self Transfer",
            "Transfer Out",
            "LTFU"
        ),
        patient_source: Sequelize.STRING,
        locator_county: Sequelize.STRING,
        locator_sub_county: Sequelize.STRING,
        locator_ward: Sequelize.STRING,
        locator_location: Sequelize.STRING,
        locator_village: Sequelize.STRING,
        message_type: Sequelize.STRING,
        send_log: Sequelize.STRING
        
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "tbl_client"
    }
);

function validateClient(client) {
    const schema = {
        group_id: Joi.number(),
        mfl_code: Joi.number()
            .min(5)
            .max(5),
        clinic_number: Joi.number()
            .min(10)
            .max(10),
        file_no: Joi.string(),
        locator_county: Joi.string(),
        locator_sub_county: Joi.string(),
        locator_ward: Joi.string(),
        locator_village: Joi.string(),
        locator_location: Joi.string(),
        gender: Joi.number().required(),
        marital: Joi.number().required(),
        client_status: Joi.string(),
        enrollment_date: Joi.date(),
        art_date: Joi.date(),
        dob: Joi.date().required(),
        phone_no: Joi.string()
            .max(10)
            .min(10),
        status: Joi.string(),
    };

    return Joi.validate(client, schema);
}
exports.Client = Client;
exports.validateClient = validateClient;