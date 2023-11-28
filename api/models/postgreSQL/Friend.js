const Sequelize = require('sequelize');
const fs = require('fs');
// 建立 Sequelize 實例，連接到 PostgreSQL 資料庫
const sequelize = new Sequelize({
  dialect: 'postgres',       // 指定使用 PostgreSQL
  host: 'gps-user-data.postgres.database.azure.com', // 填入你的主機地址
  port: 5432,
  username: 'gps',            // 填入你的用戶名
  password: '*Usertest', // 填入你的密碼
  database: 'postgres',               // 填入你的數據庫名稱
  dialectOptions: {
    ssl: {
      ca: fs.readFileSync('./DigiCertGlobalRootCA.crt.pem'),  // 這裡可能需要根據你的 PostgreSQL 設定進行調整
    },
  },
  pool: {
    max: 5, // 最大连接数
    min: 0, // 最小连接数
    acquire: 30000, // 获得连接的最大等待时间（毫秒）
    idle: 10000, // 连接池在释放连接之前将保持空闲的时间（毫秒）
  },
});

// 定義 User 模型
const users = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    defaultValue: Sequelize.literal("nextval('users_id_seq'::regclass)"),
    // 定義主鍵欄位 id，並設定默認值為 nextval('users_id_seq'::regclass)
  },
  name: {
    type: Sequelize.STRING,
    // 定義 name 欄位，類型為字串
  },
  user_img: {
    type: Sequelize.BLOB,
    // 定義 user_img 欄位，類型為 BLOB
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true ,
    // 定義 email 欄位，類型為字串，且不允許為空
  },
  phonenumber: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true ,
    // 定義 phonenumber 欄位，類型為整數，且不允許為空
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    // 定義 password 欄位，類型為字串，且不允許為空
  },
  dob: {
    type: Sequelize.DATE,
    // 定義 dob 欄位，類型為日期時間
  },
  img_path: {
    type: Sequelize.STRING,
    // 定義 img_path 欄位，類型為字串
  },
  driverstate: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'users', // 指定資料庫表格名稱為 'users'
  timestamps: false, // 如果 users 表格沒有包含 createdAt 和 updatedAt 欄位，設為 false
});

// 定義 Friends 模型
const FriendsReq = sequelize.define('FriendsReq', {
  participants: Sequelize.INTEGER, // 關聯到user表的id
  requestTo: Sequelize.STRING, // 對email發送請求
  accepted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false // 預設為false
  }
});

const Friends = sequelize.define('Friends', {
  userId: Sequelize.INTEGER, // 關聯到user表中的id
  friends: Sequelize.STRING, // 儲存通過好友請求的email
});

// 建立 Friends 模型與 User 模型之間的關聯
FriendsReq.belongsTo(users, { foreignKey: 'requestTo', targetKey: 'email', as: 'requestedUser' });
FriendsReq.belongsTo(users, { foreignKey: 'participants', targetKey: 'id', as: 'participantUser' });
Friends.belongsTo(users, {foreignKey: 'userId', targetKey: 'id', as: 'userIdUser'});
Friends.belongsTo(users, {foreignKey: 'friends', targetKey: 'email', as: 'friendsUser'});


// 同步資料庫，創建或更新表格
FriendsReq.sync({ force: false });
Friends.sync({ force: false });

// 導出 Friends 模型
module.exports = {users,FriendsReq, Friends};
