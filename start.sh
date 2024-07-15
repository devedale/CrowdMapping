#!/bin/bash

# Ferma e rimuove tutti i container, le immagini e i volumi definiti nel docker-compose.yml
docker-compose down --rmi all --volumes

# Cancella i file se esistono
RM_FILE="./db/initdb/init.sql"
if [ -f "$RM_FILE" ]; then
    echo "Rimuovo il file $RM_FILE"
    rm "$RM_FILE"
else
    echo "Il file $RM_FILE non esiste"
fi

RM_FILE="./app/src/services/jwtRS256.key"
if [ -f "$RM_FILE" ]; then
    echo "Rimuovo il file $RM_FILE"
    rm "$RM_FILE"
else
    echo "Il file $RM_FILE non esiste"
fi

RM_FILE="./app/src/middlewares/jwtRS256.key.pub"
if [ -f "$RM_FILE" ]; then
    echo "Rimuovo il file $RM_FILE"
    rm "$RM_FILE"
else
    echo "Il file $RM_FILE non esiste"
fi


if grep -q '^RSA_AUTH=true' .env; then
    echo "RSA_AUTH è impostato su true. Genero chiavi RSA..."
    ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key -N ""
    openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
    mv jwtRS256.key ./app/src/services/jwtRS256.key 
    mv jwtRS256.key.pub ./app/src/middlewares/jwtRS256.key.pub 
elif grep -q '^RSA_AUTH=test' .env; then
    echo "RSA_AUTH è impostato su test. Copio chiavi RSA dalla cartella ./test..."
    cp ./test/jwtRS256.key ./app/src/services/jwtRS256.key 
    cp ./test/jwtRS256.key.pub ./app/src/middlewares/jwtRS256.key.pub 
else
    echo "RSA_AUTH non è impostato su true o test."
fi



# Cancella i file se esistono
ENV_FILE="./.env"
if [ -f "$ENV_FILE" ]; then
    echo "File .env presente"
else
    cp example.env .env
    echo "File .env copiato da file example.env"
fi





# Avvia i servizi definiti nel docker-compose.yml utilizzando il file .env
docker-compose --env-file .env up



