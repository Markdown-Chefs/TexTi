require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    SERVER_URL: process.env.SERVER_URL,
    CLIENT_URL: process.env.CLIENT_URL,
    SECRET: process.env.SECRET,
    NODE_ENV: process.env.NODE_ENV,

    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_USER_PASSWORD: process.env.DATABASE_USER_PASSWORD,
    DATABASE_PORT: process.env.DATABASE_PORT
}