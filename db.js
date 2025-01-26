const { Pool } = require("pg"); 

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'poolsdb',
    password: '0000',
    port: 5432,
    idleTimeoutMillis: 300
});

pool.connect()
    .then(()=> console.log("Connected to PostgressSQL"))
    .catch(err=> console.error("Database connection error", err));

module.exports = {pool};