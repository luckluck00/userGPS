const Pool = require('pg').Pool;

const pool = new Pool({
    host: "127.0.0.1",
    user: "postgres",
    password: "ray58111",
    database: "postgres",
    port: 5432,
});

module.exports = pool;