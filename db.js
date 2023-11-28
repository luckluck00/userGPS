const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: "gps-user-data.postgres.database.azure.com",
    user: "gps",
    password: "*Usertest",
    database: "postgres", // 在這裡填入你的資料庫名稱
    port: 5432,
    ssl: {
        ca: fs.readFileSync('./DigiCertGlobalRootCA.crt.pem'),  // 這裡可能需要根據你的 PostgreSQL 設定進行調整
      },
});

module.exports = pool;
