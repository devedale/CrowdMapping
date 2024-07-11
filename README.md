

sh ./start.sh

docker-compose down --rmi all --volumes
docker-compose --env-file .env up




docker-compose down --rmi all --volumes
tsc --project ./app
docker-compose --env-file .env up

docker-compose down --rmi all --volumes

docker-compose --env-file .env up


ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub





ssh-keygen -t rsa -b 4096 -m PEM -f ./app/src/services/jwtRS256.key
openssl rsa -in ./app/src/services/jwtRS256.key -pubout -outform PEM -out ./app/src/middlewares/jwtRS256.key.pub



########

#!/bin/bash

export DB_USER=$POSTGRES_USER
export DB_PASSWORD=$POSTGRES_PASSWORD
export DB_NAME=$POSTGRES_DB

# Create init.sql
cat << EOF > /docker-entrypoint-initdb.d/init.sql

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

chmod -R 755 /docker-entrypoint-initdb.d/init.sql
#psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < /docker-entrypoint-initdb.d/init.sql

echo "Directory listing after creating init.sql:"
ls -l /docker-entrypoint-initdb.d/
#############

###!!!!!!!!!ATTENZIONE!!!!!!!!###
init.sql non deve essere presente nella cartella initdb 
nella cartella initdb, all'avvio, deve essere presente soltanto init.sh