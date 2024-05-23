const config = require('./bucket');

const { Pool } = require('pg');
const pool = new Pool({
    user: config.DATABASE_USER,
    host: config.DATABASE_HOST,
    database: config.DATABASE_NAME,
    password: config.DATABASE_USER_PASSWORD,
    port: config.DATABASE_PORT
});

module.exports = {
    query: (text, params) => pool.query(text, params),
}