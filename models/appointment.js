const sequelize = require("../dbconnection");
const Sequelize = require("sequelize");
const {
    AppointmentType
} = require("./appointment_type");

const Appointment = sequelize.sequelize.define(
    "appointments", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        clinic_number: {
            type: Sequelize.NUMBER,
            unique: true,
            allowNull: false,
            len: 10
        },
        appntmnt_date: Sequelize.DATEONLY,
        app_type_1: Sequelize.INTEGER,
        SENDING_APPLICATION: Sequelize.STRING,
        APPOINTMENT_REASON: Sequelize.STRING,
        app_status: Sequelize.ENUM(
            "Booked",
            "Notified",
            "Missed",
            "Defaulted",
            "LTFU"
        ),
        db_source: Sequelize.STRING,
        active_app: Sequelize.INTEGER,
        APPOINTMENT_LOCATION: Sequelize.STRING,
        reason: Sequelize.STRING,
        processed: Sequelize.STRING,
        date_processed: Sequelize.DATE,
        placer_appointment_numbr: Sequelize.STRING,
        mfl_code: {
            type: Sequelize.INTEGER,
            len: 5
        },
        message_type: Sequelize.STRING,
        send_log: Sequelize.STRING
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "tbl_appointment"
    }
);
// Appointment.belongsTo(AppointmentType, {
//     as: "app_type",
//     foreignKey: "app_type_1",
// });
// Appointment.belongsTo(Client, {
//     as: "client_id",
//     foreignKey: "client_id",
// });

exports.Appointment = Appointment;