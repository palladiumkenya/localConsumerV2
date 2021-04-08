var request = require("request");

var moment = require("moment");



var express = require("express");

var schedule = require("node-schedule");

var connectivity = require("connectivity");

var winston = require("winston");

var internetAvailable = require("internet-available");

//sql connection to live db

let mysql = require('mysql');

var config_local = require('../db_config/config_local');

var config_remote = require('../db_config/config_remote');


var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var express = require("express");

var bodyParser = require("body-parser");



// create a rolling file logger based on date/time that fires process events

var opts = {

	errorEventName: "error",

	logDirectory: "SysLogs", // NOTE: folder must exist and be writable...

	fileNamePattern: "roll-<DATE>.log",

	dateFormat: "YYYY.MM.DD",

};

var log = require("simple-node-logger").createRollingFileLogger(opts);



var app = express();

app.use(bodyParser.json());


app.use(bodyParser.urlencoded({ extended: true }));

module.exports = function (app) {

	app.post("/hl7_message", function (req, res) {

		"use strict";


		var hl7_message = (req.body);

        internetAvailable().then(function(hl7_message){
            console.log("Internet available");
        
            var options = {
        
                method: "POST",
        
                url: "https://il.mhealthkenya.co.ke/hl7_message",
        
                headers: {
        
                    "Content-Type": "application/json",
        
                },
        
                body:hl7_message,
        
                json: true,
        
            };
        
        
        
            request(options, function (error, response, body) {
        
                if (error) throw new Error(error);
        
        
        
                console.log(response);
        
            });
        
            res.send(true);
        
            // If internet push data from local to live
        
            var connection = mysql.createConnection(config_remote.localDatabaseOptions);
        
            connection.connect(function(err) {
                if (err){
        
                    console.log(err);
        
                } else {
        
                    connection.query("select f_name, m_name , l_name , dob , clinic_number , mfl_code , gender , marital , phone_no , GODS_NUMBER , group_id , SENDING_APPLICATION , PATIENT_SOURCE , enrollment_date , client_type , partner_id , processed from clients ", function (err, result, fields) {
                        
                        if(err) {console.log(err)};
        
                        console.log(result)

                        //add to remote db
        
                    });	
        
        
        
                    connection.query("select clinic_number ,appntmnt_date , app_type_1 , APPOINTMENT_REASON , app_status , db_source , active_app ,APPOINTMENT_LOCATION , reason , processed from appointments ", function (err, result, fields) {
                        
                        if(err) {console.log(err)};
        
                        console.log(result)

                        //add to remote db
        
                        connection.end();
        
                    });	
                    
                } 
        
        
            });	
        
        
            }).catch(function(){
                console.log("No internet, saving data locally");
        
                //if offline push data from request to local db
        
                var hl7_message = {"MESSAGE_HEADER":{"SENDING_APPLICATION":"KENYAEMR","SENDING_FACILITY":"13939","RECEIVING_APPLICATION":"IL","RECEIVING_FACILITY":"13939","MESSAGE_DATETIME":"20210212090359","SECURITY":"","MESSAGE_TYPE":"SIU^S12","PROCESSING_ID":"P"},"PATIENT_IDENTIFICATION":{"EXTERNAL_PATIENT_ID":{"ID":"","IDENTIFIER_TYPE":"GODS_NUMBER","ASSIGNING_AUTHORITY":"MPI"},"INTERNAL_PATIENT_ID":[{"ID":"13939-15477","IDENTIFIER_TYPE":"CCC_NUMBER","ASSIGNING_AUTHORITY":"CCC"}],"PATIENT_NAME":{"FIRST_NAME":"JOHN","MIDDLE_NAME":"OTIENO","LAST_NAME":"LUSI"},"MOTHER_NAME":{"FIRST_NAME":"","MIDDLE_NAME":"","LAST_NAME":""},"DATE_OF_BIRTH":"","SEX":"","PATIENT_ADDRESS":{"PHYSICAL_ADDRESS":{"VILLAGE":"","WARD":"","SUB_COUNTY":"","COUNTY":"","GPS_LOCATION":"","NEAREST_LANDMARK":""},"POSTAL_ADDRESS":""},"PHONE_NUMBER":"","MARITAL_STATUS":"","DEATH_DATE":"","DEATH_INDICATOR":"","DATE_OF_BIRTH_PRECISION":""},"APPOINTMENT_INFORMATION":[{"APPOINTMENT_REASON":"","ACTION_CODE":"A","APPOINTMENT_PLACING_ENTITY":"KENYAEMR","APPOINTMENT_STATUS":"PENDING","APPOINTMENT_TYPE":"","APPOINTMENT_NOTE":"N/A","APPOINTMENT_DATE":"20210507","PLACER_APPOINTMENT_NUMBER":{"ENTITY":"KENYAEMR","NUMBER":""}}]}
        
                var connection = mysql.createConnection(config_local.localDatabaseOptions);
        
                var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD");
        
                var message_type = hl7_message.MESSAGE_HEADER.MESSAGE_TYPE;
                var SENDING_APPLICATION = hl7_message.MESSAGE_HEADER.SENDING_APPLICATION;
                var MESSAGE_DATETIME = hl7_message.MESSAGE_HEADER.MESSAGE_DATETIME;
        
                if (SENDING_APPLICATION === 'KENYAEMR' || SENDING_APPLICATION === 'ADT') {
        
                    if (message_type == "ADT^A04") {
        
                        var GODS_NUMBER = hl7_message.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
                        var CCC_NUMBER;
                        var FIRST_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.FIRST_NAME;
                        var MIDDLE_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.MIDDLE_NAME;
                        var LAST_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.LAST_NAME;
                        var DATE_OF_BIRTH = hl7_message.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
                        var SEX;
                        var PHONE_NUMBER;
                        var MARITAL_STATUS;
                        var PATIENT_SOURCE = hl7_message.PATIENT_VISIT.PATIENT_SOURCE;
                        var ENROLLMENT_DATE = hl7_message.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
                        var PATIENT_TYPE = hl7_message.PATIENT_VISIT.PATIENT_TYPE;
                        var SENDING_FACILITY;
                        var GROUP_ID;
        
                        var result = get_json(hl7_message);
        
                        console.log(result);
        
                        for (var i = 0; i < result.length; i++) {
                            var key = result[i].key;
                            var value = result[i].value;
        
                            if (key == "DATE_OF_BIRTH") {
                                var DoB = DATE_OF_BIRTH;
            
                                var year = DoB.substring(0, 4);
                                var month = DoB.substring(4, 6);
                                var day = DoB.substring(6, 8);
            
                                var today = DATE_TODAY;
            
                                var new_date = year + "-" + month + "-" + day;
                                var date_diff = moment(today).diff(
                                    moment(new_date).format("YYYY-MM-DD"),
                                    "days"
                                );
            
                                if (date_diff >= 5475 && date_diff <= 6935) {
                                    GROUP_ID = "2";
                                }
                                if (date_diff >= 7300) {
                                    GROUP_ID = "1";
                                }
                                if (date_diff <= 5110) {
                                    GROUP_ID = "6";
                                }
                            } else if (key == "SEX") {
                                if (result[i].value == "F") {
                                    SEX = "1";
                                } else {
                                    SEX = "2";
                                }
                            } else if (key == "PHONE_NUMBER") {
                                PHONE_NUMBER = result[i].value;
                            } else if (key == "MARITAL_STATUS") {
                                if (result[i].value === "") {
                                    MARITAL_STATUS = "1";
                                }
                                if (result[i].value == "D") {
                                    MARITAL_STATUS = "3";
                                } else if (result[i].value == "M") {
                                    MARITAL_STATUS = "2";
                                } else if (result[i].value == "S") {
                                    MARITAL_STATUS = "1";
                                } else if (result[i].value == "W") {
                                    MARITAL_STATUS = "4";
                                } else if (result[i].value == "C") {
                                    MARITAL_STATUS = "5";
                                }
                            }
                            if (key == "SENDING_FACILITY") {
                                SENDING_FACILITY = result[i].value;
                            }
                            if (key == "ID") {
                                if (result[i + 1].value == "CCC_NUMBER") {
                                    CCC_NUMBER = result[i].value;
                                }
                            }
                        }
        
                        var enroll_year = ENROLLMENT_DATE.substring(0, 4);
                        var enroll_month = ENROLLMENT_DATE.substring(4, 6);
                        var enroll_day = ENROLLMENT_DATE.substring(6, 8);
                        var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;
        
                        if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                            response = `Invalid CCC Number: ${CCC_NUMBER}`;
                            console.log(response);
                            return;
                        }
        
                        console.log("ndani");
        
                        connection.connect(function(err, connection) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                var gateway_sql =
                                    "Insert into tbl_client (f_name,m_name,l_name,dob,clinic_number,mfl_code,gender,marital,phone_no,GODS_NUMBER,group_id, SENDING_APPLICATION, PATIENT_SOURCE, db_source, enrollment_date, client_type, partner_id) VALUES ('" +
                                    FIRST_NAME +
                                    "', '" +
                                    MIDDLE_NAME +
                                    "','" +
                                    LAST_NAME +
                                    "','" +
                                    new_date +
                                    "','" +
                                    CCC_NUMBER +
                                    "','" +
                                    SENDING_FACILITY +
                                    "','" +
                                    SEX +
                                    "','" +
                                    MARITAL_STATUS +
                                    "','" +
                                    PHONE_NUMBER +
                                    "','" +
                                    GODS_NUMBER +
                                    "','" +
                                    parseInt(GROUP_ID) +
                                    "','" +
                                    SENDING_APPLICATION +
                                    "','" +
                                    PATIENT_SOURCE +
                                    "','" +
                                    SENDING_APPLICATION +
                                    "','" +
                                    new_enroll_date +
                                    "','" +
                                    PATIENT_TYPE +
                                    "',(SELECT  partner_id FROM tbl_partner_facility WHERE mfl_code ='"+ SENDING_FACILITY +"'))";
            
                                // Use the connection
                                connection.query(gateway_sql, function(error, results, fields) {
                                    // And done with the connection.
                                    if (error) {
            
                                        console.log(error);
            
                                    } else {
            
                                        console.log(results);
                                        connection.release();
            
                                    }
                                    // Don't use the connection here, it has been returned to the pool.
                                });
        
                            }
                        });
        
                    } else if (message_type == "ADT^A08") {
        
                        var GODS_NUMBER = hl7_message.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
                        var CCC_NUMBER;
                        var FIRST_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.FIRST_NAME;
                        var MIDDLE_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.MIDDLE_NAME;
                        var LAST_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.LAST_NAME;
                        var DATE_OF_BIRTH = hl7_message.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
                        var SEX;
                        var PHONE_NUMBER;
                        var MARITAL_STATUS;
                        var PATIENT_SOURCE = hl7_message.PATIENT_VISIT.PATIENT_SOURCE;
                        var ENROLLMENT_DATE = hl7_message.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
                        var PATIENT_TYPE = hl7_message.PATIENT_VISIT.PATIENT_TYPE;
                        var SENDING_FACILITY;
                        var GROUP_ID;
                        var TOD_DATE = moment().format("YYYY-MM-DD");
            
                        var result = get_json(hl7_message);
            
                        for (var i = 0; i < result.length; i++) {
                            var key = result[i].key;                
                            var value = result[i].value;
                            
                            if (key == "DATE_OF_BIRTH") {
                                var DoB = DATE_OF_BIRTH;
            
                                var year = DoB.substring(0, 4);
                                var month = DoB.substring(4, 6);
                                var day = DoB.substring(6, 8);
            
                                var today = DATE_TODAY;
            
                                var new_date = year + "-" + month + "-" + day;
                                var date_diff = moment(today).diff(
                                    moment(new_date).format("YYYY-MM-DD"),
                                    "days"
                                );
            
                                if (date_diff >= 5475 && date_diff <= 6935) {
                                    GROUP_ID = "2";
                                }
                                if (date_diff >= 7300) {
                                    GROUP_ID = "1";
                                }
                                if (date_diff <= 5110) {
                                    GROUP_ID = "6";
                                }
                            } else if (key == "SEX") {
                                if (result[i].value == "F") {
                                    SEX = "1";
                                } else {
                                    SEX = "2";
                                }
                            } else if (key == "PHONE_NUMBER") {
                                PHONE_NUMBER = result[i].value;
                            } else if (key == "MARITAL_STATUS") {
                                if (result[i].value === "") {
                                    // do stuff
                                    MARITAL_STATUS = "1";
                                }
                                if (result[i].value == "D") {
                                    MARITAL_STATUS = "3";
                                } else if (result[i].value == "M") {
                                    MARITAL_STATUS = "2";
                                } else if (result[i].value == "S") {
                                    MARITAL_STATUS = "1";
                                } else if (result[i].value == "W") {
                                    MARITAL_STATUS = "4";
                                } else if (result[i].value == "C") {
                                    MARITAL_STATUS = "5";
                                } else {
                                    MARITAL_STATUS = "1";
                                }
                            }
                            if (key == "SENDING_FACILITY") {
                                SENDING_FACILITY = result[i].value;
                            }
                            if (key == "ID") {
                                if (result[i + 1].value == "CCC_NUMBER") {
                                    CCC_NUMBER = result[i].value;
                                }
                            }
                        }
            
                        var enroll_year = ENROLLMENT_DATE.substring(0, 4);
                        var enroll_month = ENROLLMENT_DATE.substring(4, 6);
                        var enroll_day = ENROLLMENT_DATE.substring(6, 8);
                        var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;
            
                        if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                            console.log("Invalid CCC NUMBER");
                            return;
                        }
            
                        connection.connect(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
            
                                var update_sql =
                                    "update tbl_client SET f_name='" +
                                    FIRST_NAME +
                                    "',m_name='" +
                                    MIDDLE_NAME +
                                    "',l_name='" +
                                    LAST_NAME +
                                    "',dob='" +
                                    DATE_OF_BIRTH +
                                    "',mfl_code='" +
                                    SENDING_FACILITY +
                                    "',gender='" +
                                    SEX +
                                    "',marital='" +
                                    MARITAL_STATUS +
                                    "',phone_no='" +
                                    PHONE_NUMBER +
                                    "',group_id='" +
                                    GROUP_ID +
                                    "',partner_id=(SELECT  partner_id FROM tbl_partner_facility WHERE mfl_code =' "+ SENDING_FACILITY 
                                    +"') WHERE clinic_number='" +
                                    CCC_NUMBER +
                                    "' ";
            
                                // Use the connection
                                connection.query(update_sql, function(error, results, fields) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log(results);
                                        // And done with the connection.
                                        connection.release();
                                    }
            
                                    // Don't use the connection here, it has been returned to the pool.
                                });
                            }
                        });
        
                    } else if (message_type == "SIU^S12") {
                        var GODS_NUMBER = hl7_message.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
                        var SENDING_FACILITY;
            
                        var CCC_NUMBER;
                        var APPOINTMENT_REASON;
                        var APPOINTMENT_TYPE;
                        var APPOINTMENT_DATE;
                        var APPOINTMENT_PLACING_ENTITY;
                        var APPOINTMENT_LOCATION;
                        var ACTION_CODE;
                        var APPOINTMENT_NOTE;
                        var APPOINTMENT_HONORED;
            
                        var result = get_json(hl7_message);
            
                        for (var i = 0; i < result.length; i++) {
                            var key = result[i].key;
                            var key_value = result[i].value;
            
                            if (key == "SENDING_FACILITY") {
                                SENDING_FACILITY = result[i].value;
                            } else if (key == "GODS_NUMBER") {
                                GODS_NUMBER = result[i].value;
                            } else if (key == "APPOINTMENT_REASON") {
                                APPOINTMENT_REASON = result[i].value;
                            } else if (key == "APPOINTMENT_TYPE") {
                                APPOINTMENT_TYPE = result[i].value;
                            } else if (key == "APPOINTMENT_LOCATION") {
                                APPOINTMENT_LOCATION = result[i].value;
                            } else if (key == "APPINTMENT_HONORED") {
                                APPOINTMENT_HONORED = result[i].value;
                            } else if (key == "APPOINTMENT_NOTE") {
                                APPOINTMENT_NOTE = result[i].value;
                            } else if (key == "ACTION_CODE") {
                                ACTION_CODE = result[i].value;
                            } else if (key == "APPOINTMENT_PLACING_ENTITY") {
                                APPOINTMENT_PLACING_ENTITY = result[i].value;
                            } else if (key == "APPOINTMENT_DATE") {
                                APPOINTMENT_DATE = result[i].value;
                                APPOINTMENT_DATE = APPOINTMENT_DATE;
            
                                var year = APPOINTMENT_DATE.substring(0, 4);
                                var month = APPOINTMENT_DATE.substring(4, 6);
                                var day = APPOINTMENT_DATE.substring(6, 8);
            
                                var app_date = year + "-" + month + "-" + day;
            
                                var current_date = moment(new Date());
                                var today = current_date.format("YYYY-MM-DD");
            
                                var BirthDate = moment(app_date);
                                APPOINTMENT_DATE = BirthDate.format("YYYY-MM-DD");
                            }
                            
                            if (key == "ID") {
                                if (result[i + 1].value == "CCC_NUMBER") {
                                    CCC_NUMBER = result[i].value;
                                }
                            }
                        }
            
                        if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                            console.log("Invalid CCC NUMBER");
                        }
            
                        if (!APPOINTMENT_TYPE) {
                            APPOINTMENT_TYPE = 1;
                        }
        
                        connection.connect(function(err) {
                            if (err){
        
                                console.log(err);
        
                            } else {
        
                                // var get_client_sql =
                                // 	"Select * from tbl_client where clinic_number='" +
                                // 	CCC_NUMBER +
                                // 	"'  LIMIT 1";
            
            
                                if (APPOINTMENT_LOCATION == "PHARMACY" || APPOINTMENT_REASON == "REGIMEN REFILL") {
                                    APPOINTMENT_TYPE = 1;
                                } else {
                                    APPOINTMENT_TYPE = 2;
                                }
        
                                var APP_STATUS = "Booked";
                                var ACTIVE_APP = "1";
                                var SENDING_APPLICATION =
                                    hl7_message.MESSAGE_HEADER.SENDING_APPLICATION;
                                if (ACTION_CODE == "A") {
        
                                
                                    var appointment_sql =
                                    "Insert into appointment (client_id,appntmnt_date,app_type_1,APPOINTMENT_REASON,app_status,db_source,active_app,APPOINTMENT_LOCATION,reason) VALUES ('" +
                                    client_id +
                                    "', '" +
                                    APPOINTMENT_DATE +
                                    "','" +
                                    APPOINTMENT_TYPE +
                                    "','" +
                                    APPOINTMENT_REASON +
                                    "','" +
                                    APP_STATUS +
                                    "','" +
                                    SENDING_APPLICATION +
                                    "','" +
                                    ACTIVE_APP +
                                    "','" +
                                    APPOINTMENT_LOCATION +
                                    "','" +
                                    APPOINTMENT_NOTE +
                                    "')";
                                }
            
                                if (ACTION_CODE == "D") {
                                    //Delete an Appointment
                                }
                                if (ACTION_CODE == "U") {
                                    //Update an Appointment
                                    var appointment_sql =
                                    "Update appointment SET appntmnt_date='" +
                                    APPOINTMENT_DATE +
                                    "' , app_type_1='" +
                                    APPOINTMENT_TYPE +
                                    "',reason='" +
                                    APPOINTMENT_NOTE +
                                    "',expln_app='" +
                                    APPOINTMENT_REASON +
                                    "',client_id ='"+client_id+"' ,APPOINTMENT_LOCATION ='"+ APPOINTMENT_LOCATION +
                                    "',APPOINTMENT_REASON='"+APPOINTMENT_REASON+
                                    "',app_status='"+APP_STATUS+"',db_source='"+SENDING_APPLICATION+
                                    "',active_app='"+ACTIVE_APP+"',reason='"+APPOINTMENT_NOTE+
                                    "' WHERE client_id = '"+client_id+"' ORDER BY appntmnt_date DESC LIMIT 1";
                                }
            
                                // Use the connection
                                console.log(appointment_sql);
                                connection.query(appointment_sql, function(
                                    error,
                                    results,
                                    fields
                                ) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log(results);
                                    }
                                    // And done with the connection.
                                    connection.release();
        
                                    // Don't use the connection here, it has been returned to the pool.
                                });
        
                                
                            } 
        
                        });	
                        
                    }
        
                } else {
        
                    console.log("IQCare Message, skip")
                }	
        
            });


	});



	// Tell our app to listen on port 3000

	// app.listen(1440, function (err) {

	// 	if (err) {

	// 		log.info(err);

	// 	} else {

	// 		console.log("T4A HL7 Consumer Server started on port 1440");

	// 		log.info("T4A HL7 Consumer Server listening on port 1440");

	// 	}

	// });


	var j = schedule.scheduleJob("30 * * * * *", function (fireDate) {

		var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD H:m:s");

		console.log(DATE_TODAY);

		console.log(

			"This cron job is supposed to run at => " +

				DATE_TODAY +

				"And FireDate => " +

				fireDate +

				" "

		);



		var getVirals = {

			method: "POST",

			url: "https://mlab.mhealthkenya.co.ke/api/get/il/viral_loads",

			headers: {

				"cache-control": "no-cache",

				"Content-Type": "application/json",

			},

			body: { mfl_code: 14080 },

			json: true,

		};



		request(getVirals, function (error, response, body) {

			if (error) { console.log(error) }

			if (Array.isArray(body)) {

				for (var i = 0; i < body.length; i++) {

					var data = body[i];

					var postToIL = {

						method: "POST",

						url: "http://127.0.0.1:3007/labresults/sms",

						headers: {

							"cache-control": "no-cache",

							"Content-Type": "application/json",

						},

						body: { message: data },

						json: true,

					};



					request(postToIL, function (error, response, res) {

						if (error) throw new Error(error);



						console.log(res);

					});

				}

			} else {

				console.log(body);

			}

		});

	});

};

//convert json object to key value pairs
function get_json(hl7_message) {
    var output = [];

    for (var x in hl7_message) {
        if (typeof hl7_message[x] === "object") {
            output = output.concat(get_json(hl7_message[x]));
        } else {
            output.push({
                key: x,
                value: hl7_message[x],
            });
        }
    }

    return output;
}