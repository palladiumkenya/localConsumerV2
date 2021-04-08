const mysql = require('mysql2');

//connect to default db
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'mysql',
});

//create new ushauri db
connection.query('CREATE DATABASE if not exists ushauri_il');

connection.query('use ushauri_il');

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  var clients_table = 'CREATE TABLE clients(id int primary key auto_increment, f_name VARCHAR(150), m_name VARCHAR(150), l_name VARCHAR(150), dob DATETIME, clinic_number VARCHAR(40), mfl_code INTEGER(8), gender INTEGER(8), marital INTEGER(8), phone_no VARCHAR(15), GODS_NUMBER VARCHAR(15), group_id INTEGER(4), SENDING_APPLICATION VARCHAR(25), PATIENT_SOURCE VARCHAR(25), enrollment_date DATETIME, client_type VARCHAR(15), partner_id INTEGER(4), processed INTEGER(4) )';
  connection.query(clients_table, function (err, result) {
    if (err) throw err;
    console.log("Table created", result);
  });

  var appointments_table = 'CREATE TABLE appointments(id int primary key auto_increment, clinic_number VARCHAR(40) ,appntmnt_date DATETIME, app_type_1 INTEGER(4), APPOINTMENT_REASON VARCHAR(40), app_status VARCHAR(40), db_source VARCHAR(40), active_app VARCHAR(40),APPOINTMENT_LOCATION VARCHAR(40), reason VARCHAR(40), processed INTEGER(4) )';
  connection.query(appointments_table, function (err, result) {
    if (err) throw err;
    console.log("Table created", result);
  });

  connection.end();

});

