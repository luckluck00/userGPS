const Pool = require('pg').Pool;

const pool = new Pool({
    host: "192.168.31.119",
    user: "postgres",
    password: "",
    database: "postgres",
    port: 5432,
});

module.exports = pool;