const Sequelize = require('sequelize');
const { users, FriendsReq,Friends } = require('./Friend'); 
const config = require('../../../config')

const fs = require('fs')
// 建立 Sequelize 實例，連接到 PostgreSQL 資料庫
console.log(`${process.env.AZURE_PG_PW}`);
const sequelize = new Sequelize({
  dialect: 'postgres',       // 指定使用 PostgreSQL
  host: 'gps-user-data.postgres.database.azure.com', // 填入你的主機地址
  port: 5432,
  username: 'gps',            // 填入你的用戶名
  password: config.database.password, // 填入你的密碼
  database: 'postgres',               // 填入你的數據庫名稱
  dialectOptions: {
    ssl: {
      ca: fs.readFileSync('./DigiCertGlobalRootCA.crt.pem'),  // 這裡可能需要根據你的 PostgreSQL 設定進行調整
    },
  },
});

// 定義 DriverReq 模型
const DriverReq = sequelize.define('DriverReq', {
  DriverEmail: Sequelize.STRING, // 对 email 发送请求
  accepted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false // 默认为 false
  },
  // 添加时间戳字段
  selectedTime: {
    type: Sequelize.DATE,
  },
  location: {
    type: Sequelize.STRING,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW')
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW')
  },
  // 添加消息字段
  message: Sequelize.STRING
});
const Uber = sequelize.define('Uber', {
  userEmail: Sequelize.STRING, // 關聯到user表中的email
  driverEmail: Sequelize.STRING, // 儲存通過好友請求的email
});

// 建立 DriverReq 模型與 User 模型之間的關聯
DriverReq.belongsTo(users, { foreignKey: 'DriverEmail', targetKey: 'email', as: 'DriverEmailUser' });
Uber.belongsTo(users, {foreignKey: 'userEmail', targetKey: 'email', as: 'userEmailUser'});
Uber.belongsTo(users, {foreignKey: 'driverEmail', targetKey: 'email', as: 'driverEmailUser'});


// 同步資料庫，創建或更新表格
DriverReq.sync({ force: false });
Uber.sync({ force: false });

// 導出 DriverReq 模型
module.exports = {DriverReq , Uber};
