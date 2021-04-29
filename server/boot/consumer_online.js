var request = require("request");
var moment = require("moment");
var express = require("express");
var axios = require("axios");
var https = require("https");
var schedule = require("node-schedule");
var internetAvailable = require("internet-available");

//sql connection to live db
let mysql = require('mysql');
var config_local = require('../db_config/config_local');
var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var express = require("express");
var bodyParser = require("body-parser");
//var db = require("../db_config/config_local.js");

var Op = require("sequelize").Op;
var {
    Client
} = require("../../models/client");
const {
    Appointment
} = require("../../models/appointment");
const {
    ClientOru
} = require("../../models/client_oru");
const {
    Logs
} = require("../../models/logs");


// create a rolling file logger based on date/time that fires process events

var opts = {

	errorEventName: "error",

	logDirectory: "SysLogs", // NOTE: folder must exist and be writable...

	fileNamePattern: "roll-<DATE>.log",

	dateFormat: "YYYY.MM.DD",

};

var log = require("simple-node-logger").createRollingFileLogger(opts);



var applctn = express();

applctn.use(bodyParser.json());


applctn.use(bodyParser.urlencoded({ extended: true }));

module.exports = function (app) {

	applctn.post("/hl7_message", function (req, res) {

		"use strict";

		var hl7_message = (req.body);

        internetAvailable().then(function(){
            console.log("Internet available");
    
            //if online run cron job to post from local db to sync endpoints
    
            var send_results_job = schedule.scheduleJob("30 * * * * * ", function (fireDate) {
    
                // If internet push data from local to live
                var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD H:m:s");    
                    console.log(DATE_TODAY);
    
                    console.log("This sync is supposed to run at => " +DATE_TODAY +"And FireDate => " +fireDate +" "
    
                );
        
            
                
    
                let results = Client.findAll({
                    where: {
                        processed: 'Pending'
                    }
                    }).then(function (results) {
                    
                        results.forEach(result => {
    
                            var options = {
        
                                method: "POST",
                        
                                url: "https://il-test.mhealthkenya.co.ke/hl7-sync-client",
                        
                                headers: {
                        
                                    "Content-Type": "application/json",
                        
                                },
                        
                                body:result,
                        
                                json: true,
                        
                            };
    
                            request(options, function (error, response, body) {
            
                                if (error) {
                    
                                    console.log(error)
    
                                    Client.update({ date_processed: DATE_TODAY, send_log: error}, {
                                        where: {
                                            id: result.id
                                        }
                                    }); 
                    
                                } else if(response) {
                                    console.log(response.body)

                                    if (response.statusCode == 200)
                                        Client.destroy({
                                            where: {
                                                id: result.id
                                            }
                                        });                            
    
                                }
    
                            });    
                    
                    });
    
                });

                let results1 = Appointment.findAll({
                        where: {
                            processed: 'Pending'
                        }
                    }).then(function (results) {
        
                        
                        results.forEach(result => {
    
                            var options = {
        
                                method: "POST",
                        
                                url: "https://il-test.mhealthkenya.co.ke/hl7-sync-appointment",
                        
                                headers: {
                        
                                    "Content-Type": "application/json",
                        
                                },
                        
                                body:result,
                        
                                json: true,
                        
                            };
    
                            request(options, function (error, response, body) {
            
                                if (error) {
                    
                                    console.log(error)
    
                                    Appointment.update({ date_processed: DATE_TODAY, send_log: error }, {
                                        where: {
                                            id: result.id
                                        }
                                    });  
                    
                                } else if(response) {
    
                                    console.log(response.body)
    
                                    // update status of updated appointment
                                    if (response.statusCode == 200)
                                        Appointment.destroy({ 
                                            where: {
                                                id: result.id
                                            }
                                        });
    
                                }
    
                            }); 
                        
                        });
        
                     });
                        
                let results2 = ClientOru.findAll({
                    where: {
                        processed: 'Pending'
                    }
                }).then(function (results) {
    
                    console.log(results)
                    
                    results.forEach(result => {
                        var options = {
        
                            method: "POST",
                    
                            url: "https://il-test.mhealthkenya.co.ke/hl7-sync-observation",
                    
                            headers: {
                    
                                "Content-Type": "application/json",
                    
                            },
                    
                            body:result,
                    
                            json: true,
                    
                        };
    
                        request(options, function (error, response, body) {
        
                            if (error) {
                
                                console.log(error)
    
                                ClientOru.update({ date_processed: DATE_TODAY, send_log: error}, {
                                    where: {
                                        id: result.id
                                    }
                                }); 
                
                            } else if(response) {
    
                                console.log(response.body)
                                if (response.statusCode == 200) 
                                    ClientOru.destroy({
                                        where: {
                                            id: result.id
                                        }
                                    });
                            }
    
                        });
                    
                    });
    
                });  
            
    
    
            });
    
            //if online post incoming requests to receiver
            
            var options = {
        
                method: "POST",
        
                url: "https://il-test.mhealthkenya.co.ke/hl7_message",
        
                headers: {
        
                    "Content-Type": "application/json",
        
                },
        
                body:hl7_message,
        
                json: true,
        
            };
        
        
        
            request(options, function (error, response, body) {
            
                if (error) {
    
                    console.log(error)
    
                } else if(response.body.response.msg != 'OK') {
    
    
                    if(response.body.response.msg != 'Validation error' ) {
    
                        var s = response.body.response.data
    
                        console.log("im here",s)
    
                        var l = {
    
                            //f_name: s.f_name,
                            //l_name: s.l_name,
                            clinic_number: s.clinic_number,
                            file_no: s.file_no,
                            message_type: message_type,
                            sending_application: s.sending_application,
                            send_log: response.body.response.msg
                            
                        }
    
    
    
                    } else{
    
                        var s = response.body.response.errors[0].instance;
    
                        var l = {
    
                            //f_name: s.f_name,
                            //l_name: s.l_name,
                            clinic_number: s.clinic_number,
                            file_no: s.file_no,
                            //message_type: message_type,
                            sending_application: s.sending_application,
                            send_log: response.body.response.errors[0].message
                            
                        }
    
                    }
    
                    
                    console.log("data",l)
    
                    async function save() {
    
                        await Logs.create(l)
                        .then(async function (response) {
                            console.log("here 1",response)
                        })
                        .catch(function (error) {
                            console.log("here 2", error)
                        })
                    }
                    
                    save();
    
    
                }
                return res.send(true)
        
            });
            
        
        }).catch(function(error){
    
            console.log("No internet, saving data locally", error);
    
            //if offline push data from request to local db
            var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD");
    
            var message_type = hl7_message.MESSAGE_HEADER.MESSAGE_TYPE;
            var SENDING_APPLICATION = hl7_message.MESSAGE_HEADER.SENDING_APPLICATION;
            var MESSAGE_DATETIME = hl7_message.MESSAGE_HEADER.MESSAGE_DATETIME;
    
            if (SENDING_APPLICATION === 'KENYAEMR' || SENDING_APPLICATION === 'ADT') {
    
                if (message_type == "ADT^A04") {
    
                    var GODS_NUMBER = hl7_message.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
                    var CCC_NUMBER;
                    var PATIENT_CLINIC_NUMBER;
                    var SENDING_FACILITY = hl7_message.MESSAGE_HEADER.SENDING_FACILITY;
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
                    var GROUP_ID;
                    var COUNTY = hl7_message.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.COUNTY;
                    var SUB_COUNTY = hl7_message.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.SUB_COUNTY;
                    var WARD = hl7_message.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.WARD;
                    var VILLAGE = hl7_message.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.VILLAGE;
                    var ART_DATE;
                    var PROCESSED = 'Pending';  
    
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
                        if (key == "ID") {
                            if (result[i + 1].value == "CCC_NUMBER") {
                                CCC_NUMBER = result[i].value;
                            }
                        }
    
                        if (key == "ID") {
                            if (result[i + 1].value == "PATIENT_CLINIC_NUMBER") {
                                PATIENT_CLINIC_NUMBER = result[i].value;
                            }
                        }
    
                        if(SENDING_APPLICATION == "ADT") {
                            if(key == "OBSERVATION_IDENTIFIER") {
                                if (result[i].value == "ART_START") {
                                    ART_DATE = result[i+3].value;
                                }  
                            } 
        
                        } else if(SENDING_APPLICATION === "KENYAEMR") {
                            if(key == "OBSERVATION_DATETIME") {
                                if (result[i + 5].value == "CURRENT_REGIMEN") {
                                    ART_DATE = result[i].value;
                                }  
                            } 
        
                                
                        }
                    }
    
                    var enroll_year = ENROLLMENT_DATE.substring(0, 4);
                    var enroll_month = ENROLLMENT_DATE.substring(4, 6);
                    var enroll_day = ENROLLMENT_DATE.substring(6, 8);
                    var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;
    
                    console.log("date", ART_DATE)
    
                    if(ART_DATE == "" || ART_DATE == undefined ) {
    
                        var new_art_date = null;
    
                    } else {
    
                        var art_year = ART_DATE.substring(0, 4);
                        var art_month = ART_DATE.substring(4, 6);
                        var art_day = ART_DATE.substring(6, 8);
                        var new_art_date = art_year + "-" + art_month + "-" + art_day;
    
                    }
    
                    if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                        response = `Invalid CCC Number: ${CCC_NUMBER}`;
                        console.log(response);
                        return;
                    }
    
                    let client = {
                        f_name: FIRST_NAME,
                        m_name: MIDDLE_NAME,
                        l_name: LAST_NAME,
                        dob: new_date,
                        clinic_number: CCC_NUMBER,
                        patient_clinic_number: PATIENT_CLINIC_NUMBER,
                        mfl_code: parseInt(SENDING_FACILITY),
                        gender: parseInt(SEX),
                        marital: MARITAL_STATUS,
                        phone_no: PHONE_NUMBER,
                        gods_number: GODS_NUMBER,
                        group_id: parseInt(GROUP_ID),
                        sending_application: SENDING_APPLICATION,
                        db_source: SENDING_APPLICATION,
                        patient_source: PATIENT_SOURCE,
                        enrollment_date: new_enroll_date,
                        art_date: new_art_date,
                        client_type: PATIENT_TYPE,
                        locator_county: COUNTY,
                        locator_sub_county: SUB_COUNTY,
                        locator_ward: WARD,
                        locator_village: VILLAGE,
                        message_type: MESSAGE_TYPE,
                        processed: PROCESSED
                    }
    
                    console.log(client)
    
                    async function saveData() {
    
                        await Client.create(client)
                        .then(function (response) {
                            let message = "OK";
                            let resp = "Client saved on local db";
                            console.log(response)
    
                            return res.json({
                                message: message,
                                data: [resp, response]
                                });
                        })
                        .catch(function (err) {
                            let code = 500;
                            let response = err.message;
    
                            return res.status(code).send(response);
                        })
    
                    }
    
                    saveData();
    
    
                } else if (message_type == "SIU^S12") {
                    var GODS_NUMBER = hl7_message.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
                    var SENDING_FACILITY;
        
                    var CCC_NUMBER;
                    var APPOINTMENT_REASON;
                    var APPOINTMENT_TYPE;
                    var APPOINTMENT_DATE;
                    var APPOINTMENT_PLACING_ENTITY;
                    var PLACER_APPOINTMENT_NUMBER;
                    var APPOINTMENT_LOCATION;
                    //var ACTION_CODE;
                    var APPOINTMENT_NOTE;
                    var APPOINTMENT_HONORED;
                    var VISIT_DATE;
                    var PROCESSED = 'Pending';
        
                    var result = get_json(hl7_message);
        
                    for (var i = 0; i < result.length; i++) {
                        var key = result[i].key;
                        var key_value = result[i].value;
        
                        if (key == "NUMBER") {
                            PLACER_APPOINTMENT_NUMBER = result[i].value;
                        } else if (key == "GODS_NUMBER") {
                            GODS_NUMBER = result[i].value;
                        } else if (key == "APPOINTMENT_REASON") {
                            APPOINTMENT_REASON = result[i].value;
                        } else if (key == "APPOINTMENT_TYPE") {
                            APPOINTMENT_TYPE = result[i].value;
                        } else if (key == "VISIT_DATE") {
                            VISIT_DATE = result[i].value;
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
    
                    if (APPOINTMENT_LOCATION == "PHARMACY" || APPOINTMENT_REASON == "REGIMEN REFILL") {
                        APPOINTMENT_TYPE = 1;
                    } else {
                        APPOINTMENT_TYPE = 2;
                    }
    
                    var APP_STATUS = "Booked";
                    var ACTIVE_APP = "1";
                    var SENDING_APPLICATION = hl7_message.MESSAGE_HEADER.SENDING_APPLICATION;
                    var SENDING_FACILITY = hl7_message.MESSAGE_HEADER.SENDING_FACILITY;
    
                    let appointment = {
                        appntmnt_date: APPOINTMENT_DATE,
                        app_type_1: APPOINTMENT_TYPE,
                        clinic_number: CCC_NUMBER,
                        message_type: MESSAGE_TYPE,
                        appointment_reason: APPOINTMENT_REASON,
                        app_status: APP_STATUS,
                        db_source: SENDING_APPLICATION,
                        active_app: ACTIVE_APP,
                        appointment_location: APPOINTMENT_LOCATION,
                        reason: APPOINTMENT_NOTE,
                        placer_appointment_number: PLACER_APPOINTMENT_NUMBER,
                        created_at: VISIT_DATE,
                        processed: PROCESSED
                    }
    
                    async function save() {
    
                        await Appointment.create(appointment)
                        .then(async function (data) {
                        console.log(data)
                        message = "OK";
                        response = "Appointment saved in local db"
    
                        return response;
                        
                        })
                        .catch(function (error) {
                            code = 500;
                            response = err.message;
                            console.log(error)
    
                            return response
                        })
    
    
                    }
    
                    save();
    
                         
                } else if(message_type === "ORU^R01") {
    
                    var GODS_NUMBER = hl7_message.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
                    var CCC_NUMBER;
                    var FIRST_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.FIRST_NAME;
                    var MIDDLE_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.MIDDLE_NAME;
                    var LAST_NAME = hl7_message.PATIENT_IDENTIFICATION.PATIENT_NAME.LAST_NAME;
                    var SENDING_APPLICATION = hl7_message.MESSAGE_HEADER.SENDING_APPLICATION;
                    var SENDING_FACILITY = hl7_message.MESSAGE_HEADER.SENDING_FACILITY;
                    var OBSERVATION_VALUE;
                    var OBSERVATION_DATETIME;
                    var MESSAGE_TYPE = hl7_message.MESSAGE_HEADER.MESSAGE_TYPE;
                    var PROCESSED = 'Pending';
    
                    var result = get_json(hl7_message);
    
                    console.log(result)
    
                    for (var i = 0; i < result.length; i++) {
                        var key = result[i].key;                
                        var value = result[i].value;
    
                        if (key == "DEATH_DATE") {
                            DEATH_DATE = result[i].value;
                        } else if (key == "DEATH_INDICATOR") {
                            DEATH_INDICATOR = result[i].value;
                        }
                            
                        if (key == "ID") {
                            if (result[i + 1].value == "CCC_NUMBER") {
                                CCC_NUMBER = result[i].value;
                            }
                        } else if(key == "OBSERVATION_VALUE") {
                            OBSERVATION_VALUE = result[i].value;
                        } else if(key == "OBSERVATION_DATETIME") {
                            OBSERVATION_DATETIME = result[i].value;
                        }
                
                    }      
    
                    if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                        response = `Invalid CCC Number: ${CCC_NUMBER}`;
                        console.log(response);
                    }
    
    
                    if(OBSERVATION_VALUE === "DEAD") {
                        var death_ind = "Deceased"
                    } else {
                        var death_ind = "Active"
                    }
    
                    var observation_year = OBSERVATION_DATETIME.substring(0, 4);
                    var observation_month = OBSERVATION_DATETIME.substring(4, 6);
                    var observation_day = OBSERVATION_DATETIME.substring(6, 8);
                    var observation_hour = OBSERVATION_DATETIME.substring(8, 10);
                    var observation_minute = OBSERVATION_DATETIME.substring(10, 12);
                    var observation_second = OBSERVATION_DATETIME.substring(12, 14);
                    var new_observation_date = observation_year + "-" + observation_month + "-" + observation_day + " " + observation_hour + ":" + observation_minute + ":" + observation_second;
    
                    if(OBSERVATION_VALUE == "TRANSFER_OUT") {
    
                        var new_value = "Transfer Out";
    
                    } else if(OBSERVATION_VALUE == "DIED") {
    
                        var new_value = "Deceased";
    
                    } else if(OBSERVATION_VALUE == "LOST_TO_FOLLOWUP") {
    
                        var new_value = "LTFU";
    
                    }   
    
                    observation = {
    
                       f_name: FIRST_NAME,
                       m_name: MIDDLE_NAME,
                       l_name: LAST_NAME,
                       clinic_number: CCC_NUMBER,
                       message_type: MESSAGE_TYPE,
                       mfl_code: SENDING_FACILITY,
                       sending_application: SENDING_APPLICATION,
                       observation_value: new_value,
                       new_observation_datetime: new_observation_date,
                       death_status: death_ind,
                       processed: PROCESSED
    
                    } 
                    
                    console.log(client)
    
                    async function save() {
    
                        await ClientOru.create(client_oru)
                        .then(function (model) {
                            message = "OK";
                            response = "Client Observation saved on local db";
    
                            return response;
                        })
                        .catch(function (error) {
                            code = 500;
                            response = err.message;
                            console.log(error)
    
                            return response;
                        })
                    }
                    
                    save();
    
    
                } else if(message_type == "ADT^A08") {
    
                    var GODS_NUMBER = hl7_message.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
                    var CCC_NUMBER;
                    var PATIENT_CLINIC_NUMBER;
                    var SENDING_FACILITY = hl7_message.MESSAGE_HEADER.SENDING_FACILITY;
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
                    var GROUP_ID;
                    var COUNTY = hl7_message.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.COUNTY;
                    var SUB_COUNTY = hl7_message.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.SUB_COUNTY;
                    var WARD = hl7_message.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.WARD;
                    var VILLAGE = hl7_message.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.VILLAGE;
                    var ART_DATE;
                    var PROCESSED = 'Pending';
    
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
                        if (key == "ID") {
                            if (result[i + 1].value == "CCC_NUMBER") {
                                CCC_NUMBER = result[i].value;
                            }
                        }
    
                        if (key == "ID") {
                            if (result[i + 1].value == "PATIENT_CLINIC_NUMBER") {
                                PATIENT_CLINIC_NUMBER = result[i].value;
                            }
                        }
    
                        if(SENDING_APPLICATION == "ADT") {
                            if(key == "OBSERVATION_IDENTIFIER") {
                                if (result[i].value == "ART_START") {
                                    ART_DATE = result[i+3].value;
                                }  
                            } 
        
                        } else if(SENDING_APPLICATION === "KENYAEMR") {
                            if(key == "OBSERVATION_DATETIME") {
                                if (result[i + 5].value == "CURRENT_REGIMEN") {
                                    ART_DATE = result[i].value;
                                }  
                            } 
                                
                        }
                    }
    
                    var enroll_year = ENROLLMENT_DATE.substring(0, 4);
                    var enroll_month = ENROLLMENT_DATE.substring(4, 6);
                    var enroll_day = ENROLLMENT_DATE.substring(6, 8);
                    var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;
    
                    if(ART_DATE == "" || ART_DATE == undefined ) {
    
                        var new_art_date = null;
    
                    } else {
    
                        var art_year = ART_DATE.substring(0, 4);
                        var art_month = ART_DATE.substring(4, 6);
                        var art_day = ART_DATE.substring(6, 8);
                        var new_art_date = art_year + "-" + art_month + "-" + art_day;
    
                    }
    
                    // if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                    //     response = `Invalid CCC Number: ${CCC_NUMBER}`;
                    //     console.log(response);
                    //     return;
                    // }
    
                    let client = {
                        f_name: FIRST_NAME,
                        m_name: MIDDLE_NAME,
                        l_name: LAST_NAME,
                        dob: new_date,
                        clinic_number: CCC_NUMBER,
                        patient_clinic_number: PATIENT_CLINIC_NUMBER,
                        mfl_code: parseInt(SENDING_FACILITY),
                        gender: parseInt(SEX),
                        marital: MARITAL_STATUS,
                        phone_no: PHONE_NUMBER,
                        GODS_NUMBER: GODS_NUMBER,
                        group_id: parseInt(GROUP_ID),
                        sending_application: SENDING_APPLICATION,
                        db_source: SENDING_APPLICATION,
                        patient_source: PATIENT_SOURCE,
                        enrollment_date: new_enroll_date,
                        art_date: new_art_date,
                        client_type: PATIENT_TYPE,
                        locator_county: COUNTY,
                        locator_sub_county: SUB_COUNTY,
                        locator_ward: WARD,
                        locator_village: VILLAGE,
                        message_type: MESSAGE_TYPE,
                        processed: PROCESSED
                    }
    
                    console.log(client)
    
                    async function save() {
    
                        await Client.create(client)
                        .then(function (response) {
                            message = "OK";
                            response = "Client saved on local db";
                            console.log(response)
    
                            return response;
                        })
                        .catch(function (error) {
                            code = 500;
                            response = error.message;
                            console.log(error)
    
                            return response;
                        })
                    }
                    
                    save();
    
                }    
    
    
            } else {
    
                console.log("IQCare Message, skip")
            }	
    
        });

        
    }); 

    
	//Tell our app to listen on port 3000

	applctn.listen(1440, function (err) {

		if (err) {

			log.info(err);

		} else {

			console.log("T4A HL7 Consumer Server started on port 1440");

			log.info("T4A HL7 Consumer Server listening on port 1440");

		}

	});

    //disabled mlab


	// var j = schedule.scheduleJob("30 * * * * *", function (fireDate) {

	// 	var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD H:m:s");

	// 	console.log(DATE_TODAY);

	// 	console.log(

	// 		"This cron job is supposed to run at => " +

	// 			DATE_TODAY +

	// 			"And FireDate => " +

	// 			fireDate +

	// 			" "

	// 	);



	// 	var getVirals = {

	// 		method: "POST",

	// 		url: "https://mlab.mhealthkenya.co.ke/api/get/il/viral_loads",

	// 		headers: {

	// 			"cache-control": "no-cache",

	// 			"Content-Type": "application/json",

	// 		},

	// 		body: { mfl_code: 14080 },

	// 		json: true,

	// 	};



	// 	request(getVirals, function (error, response, body) {

	// 		if (error) { console.log(error) }

	// 		if (Array.isArray(body)) {

	// 			for (var i = 0; i < body.length; i++) {

	// 				var data = body[i];

	// 				var postToIL = {

	// 					method: "POST",

	// 					url: "http://127.0.0.1:3007/labresults/sms",

	// 					headers: {

	// 						"cache-control": "no-cache",

	// 						"Content-Type": "application/json",

	// 					},

	// 					body: { message: data },

	// 					json: true,

	// 				};



	// 				request(postToIL, function (error, response, res) {

	// 					if (error) throw new Error(error);



	// 					console.log(res);

	// 				});

	// 			}

	// 		} else {

	// 			console.log(body);

	// 		}

	// 	});

	// });

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
