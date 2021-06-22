# localILConsumer
Install git

Install nodejs

Clone the repository at "https://github.com/mHealthKenya/localILConsumerV2" into your desired location

cd into the newly created "localILConsumerV2" folder

Run "npm install"

Update the database credentials : sudo gedit .env

Change the username and password according to your credentials

DB_USER = 'root'
DB_PASSWORD = ''
DB_NAME = 'mysql'
NEW_DB_NAME = 'ushauri_il'
DB_PORT = 3306
DB_SERVER = '127.0.0.1'

cd into the "/server" folder

Create the ushauri database and tables : node connection.js

cd into the "/server/boot" folder

Change the MFL Code in consumer_online.js on line X to reflect the facility's mfl code, also ensure you change the IP address of the IL server on line Y (if it is not running in the same server. Change only the IP address eg "http://127.0.0.1:3007/labresults/sms" to "http://xxx.x.x.x:3007/labresults/sms"

cd back to the "/server/: folder

run "pm2 start server.js"

run "pm2 startup"

run "pm2 save"

Go to the IL dashboard, under participating systems configure the address for T4A (if it is in the same machine as IL, then http://localhost:1440/hl7_message , otherwise it should point to the machine's IP address as seen by the IL machine, so http://{Ushauri IP}:1440/hl7_message)

