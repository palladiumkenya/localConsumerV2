const Sequelize = require("sequelize");
const path = require('path')
require("dotenv").config({ path: path.resolve(__dirname, '../../.env') 
});

const database = process.env.NEW_DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const port = process.env.DB_PORT;
const db_server = process.env.DB_SERVER;

const sequelize = new Sequelize(database, username, password, {
    host: db_server,
    port: port,
    dialect: "mysql"
});

const connect = async () => {
    await sequelize
        .authenticate()
        .then(() => {
            console.log("Connection has been established successfully.");
        })
        .catch(err => {
            console.log("Unable to connect to the database:", err.message);
        });
    
};

const db = {
    sequelize: sequelize,
    connect
};

module.exports = db;
