
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;

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

