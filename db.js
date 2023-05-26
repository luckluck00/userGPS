const Pool = require('pg').Pool;

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "ray58111",
    database: "postgres",
    port: 5432,
});

module.exports = pool;