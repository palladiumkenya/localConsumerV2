const sequelize = require("../server/db_config/config_local");
const Sequelize = require("sequelize");

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
        sending_application: Sequelize.STRING,
        appointment_reason: Sequelize.STRING,
        app_status: Sequelize.ENUM(
            "Booked",
            "Notified",
            "Missed",
            "Defaulted",
            "LTFU"
        ),
        db_source: Sequelize.STRING,
        active_app: Sequelize.INTEGER,
        appointment_location: Sequelize.STRING,
        reason: Sequelize.STRING,
        processed: Sequelize.STRING,
        date_processed: Sequelize.DATE,
        placer_appointment_number: Sequelize.STRING,
        mfl_code: {
            type: Sequelize.INTEGER,
            len: 5
        },
        message_type: Sequelize.STRING,
        send_log: Sequelize.STRING
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        tableName: "appointments"
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