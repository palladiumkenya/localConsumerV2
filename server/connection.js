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

  var clients_table = 'CREATE TABLE clients(id int primary key auto_increment, f_name VARCHAR(150), m_name VARCHAR(150), l_name VARCHAR(150), dob DATE, clinic_number VARCHAR(40),patient_clinic_number VARCHAR(40), mfl_code INTEGER(8), gender INTEGER(8), marital INTEGER(8), phone_no VARCHAR(15), gods_number VARCHAR(15), group_id INTEGER(4), sending_application VARCHAR(25), db_source VARCHAR(25), patient_source VARCHAR(25), enrollment_date DATE, art_date DATE NULL DEFAULT NULL, client_type VARCHAR(15), status VARCHAR(15), processed VARCHAR(15), date_processed DATETIME, locator_county VARCHAR(50), locator_sub_county VARCHAR(50), locator_ward VARCHAR(50), locator_village VARCHAR(50),locator_location VARCHAR(50), file_no VARCHAR(20), message_type VARCHAR(10), send_log VARCHAR(250), created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now())';
  connection.query(clients_table, function (err, result) {
    if (err) throw err;
    console.log("Table created", result);
  });

  var appointments_table = 'CREATE TABLE appointments(id int primary key auto_increment, clinic_number VARCHAR(40) ,appntmnt_date DATE, app_type_1 INTEGER(4), sending_application VARCHAR(35), appointment_reason VARCHAR(40), app_status VARCHAR(40), db_source VARCHAR(40), active_app VARCHAR(40),appointment_location VARCHAR(40), reason VARCHAR(40), processed VARCHAR(15), date_processed DATETIME, placer_appointment_number VARCHAR(20), mfl_code VARCHAR(20), message_type VARCHAR(25), send_log VARCHAR(250) ,created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now() )';
  connection.query(appointments_table, function (err, result) {
    if (err) throw err;
    console.log("Table created", result);
  });

  var clients_table = 'CREATE TABLE clients_oru(id int primary key auto_increment, f_name VARCHAR(150), m_name VARCHAR(150), l_name VARCHAR(150), clinic_number VARCHAR(40), mfl_code INTEGER(8), gods_number VARCHAR(15), sending_application VARCHAR(25), db_source VARCHAR(25), patient_source VARCHAR(25), observation_value VARCHAR(40), observation_datetime DATETIME, processed VARCHAR(15), date_processed DATETIME, death_status VARCHAR(15), message_type VARCHAR(25), send_log VARCHAR(250), created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now())';
  connection.query(clients_table, function (err, result) {
    if (err) throw err;
    console.log("Table created", result);
  });

  var users_table = 'CREATE TABLE users(id int primary key auto_increment, username VARCHAR(50), password VARCHAR(255), created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now())';
  connection.query(users_table, function(err, result) {
    if(err) throw err;
    console.log("Table created", result);
  });

  var logs = 'CREATE TABLE logs(id int primary key auto_increment, f_name VARCHAR(150), m_name VARCHAR(150), l_name VARCHAR(150), clinic_number VARCHAR(40), file_no VARCHAR(35), sending_application VARCHAR(35), send_log VARCHAR(255), created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now()  )';
  connection.query(logs, function(err, result) {
    if (err) throw err;
    console.log("Table created", result);
  });

  var create_user = "INSERT INTO users(username, password) VALUES ('admin', 'admin')";
  connection.query(create_user, function (err, result) {
    if(err) throw err;
    console.log("User inserted")

  })

  connection.end();

});

