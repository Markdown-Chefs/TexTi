const config = require('./bucket');

const { Pool } = require('pg');
const pool_dev = new Pool({
    user: config.DATABASE_USER,
    host: config.DATABASE_HOST,
    database: config.DATABASE_NAME,
    password: config.DATABASE_USER_PASSWORD,
    port: config.DATABASE_PORT
});
const pool_deploy = new Pool({
    connectionString: config.DATABASE_URL
});

const pool = config.NODE_ENV === 'development' ? pool_dev : pool_deploy;

module.exports = {
    query: (text, params) => pool.query(text, params),
}