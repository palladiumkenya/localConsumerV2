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

  var clients_table = 'CREATE TABLE clients(id int primary key auto_increment, f_name VARCHAR(150), m_name VARCHAR(150), l_name VARCHAR(150), dob DATETIME, clinic_number VARCHAR(40), mfl_code INTEGER(8), gender INTEGER(8), marital INTEGER(8), phone_no VARCHAR(15), GODS_NUMBER VARCHAR(15), group_id INTEGER(4), SENDING_APPLICATION VARCHAR(25), db_source(25), PATIENT_SOURCE VARCHAR(25), enrollment_date DATETIME, client_type VARCHAR(15), processed INTEGER(4), date_deceased DATETIME, locator_county VARCHAR(50), locator_sub_county VARCHAR(50), locator_ward VARCHAR(50), locator_village VARCHAR(50), file_no VARCHAR(20), date_deceased DATETIME, death_status VARCHAR(15), message_type VARCHAR(10), created_at DATETIME, updated_at DATETIME )';
  connection.query(clients_table, function (err, result) {
    if (err) throw err;
    console.log("Table created", result);
  });

  var appointments_table = 'CREATE TABLE appointments(id int primary key auto_increment, clinic_number VARCHAR(40) ,appntmnt_date DATETIME, app_type_1 INTEGER(4), APPOINTMENT_REASON VARCHAR(40), app_status VARCHAR(40), db_source VARCHAR(40), active_app VARCHAR(40),APPOINTMENT_LOCATION VARCHAR(40), reason VARCHAR(40), processed INTEGER(4), placer_appointment_number VARCHAR(20), created_at DATETIME, updated_at DATETIME )';
  connection.query(appointments_table, function (err, result) {
    if (err) throw err;
    console.log("Table created", result);
  });

  connection.end();

});

