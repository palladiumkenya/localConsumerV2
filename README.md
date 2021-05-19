# localILConsumer
Install git

Install nodejs

Clone the repository at "https://github.com/mHealthKenya/localILConsumerV2" into your desired location

cd into the newly created "localILConsumer" folder

Run "npm install"

cd into the "/server" folder

open the connection.js, change the mysql user and password and save

run "node connection.js"

cd into the "/server/db_config" folder

open the config_local.js, change the mysql user and password and save

cd back to the server directory

cd into the "/server/boot" folder

Change the MFL Code in consumer_online.js on line X to reflect the facility's mfl code, also ensure you change the IP address of the IL server on line Y (if it is not running in the same server. Change only the IP address eg "http://127.0.0.1:3007/labresults/sms" to "http://xxx.x.x.x:3007/labresults/sms""

cd back to the "/server/: folder

run "pm2 start server.js"

run "pm2 startup"

run "pm2 save"

go to the IL dashboard, under participating systems configure the address for T4A (if it is in the same machine as IL, then http://localhost:1440/hl7_message , otherwise it should point to the machine's IP address as seen by the IL machine, so http://{Ushauri IP}:1440/hl7_message)
