#!/bin/bash

export DB_USER=$POSTGRES_USER
export DB_PASSWORD=$POSTGRES_PASSWORD
export DB_NAME=$POSTGRES_DB

cat << EOF > /docker-entrypoint-initdb.d/init.sql

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Create the roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    roleid INTEGER NOT NULL REFERENCES roles(id) ON DELETE SET NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    validated INTEGER DEFAULT 0,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE EXTENSION postgis;

-- Create the reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    position GEOGRAPHY(Point) NOT NULL,
    type VARCHAR(50) NOT NULL ,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

EOF

chmod -R 755 /docker-entrypoint-initdb.d/init.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < /docker-entrypoint-initdb.d/init.sql
