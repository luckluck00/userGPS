const Sequelize = require('sequelize');
const { users, FriendsReq,Friends } = require('./Friend'); 

// 建立 Sequelize 實例，連接到 PostgreSQL 資料庫
const sequelize = new Sequelize('postgres', 'postgres', `${process.env.PG_PW}`, {
  host: '192.168.31.119',
  dialect: 'postgres',
  port: 5432,
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
