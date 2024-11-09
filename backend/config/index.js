require("dotenv").config();

const config = {
    PORT: process.env.PORT || 8000,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "manoj",
    USER_EMAIL: process.env.USER_EMAIL || "abc@gmail.com",
    USER_PASS: process.env.USER_PASS || "abc",
    POSTGRES_URL: process.env.POSTGRES_URL || "postgresql://postgres:123456789@localhost:5432/CoEdit",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_USER: process.env.DB_USER || "postgres",
    DB_PASSWORD: process.env.DB_PASSWORD || "123456789",
    DB_NAME: process.env.DB_NAME || "CoEdit",
};

module.exports = config;