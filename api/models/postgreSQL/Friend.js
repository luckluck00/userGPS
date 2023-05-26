const Sequelize = require('sequelize');

// 建立 Sequelize 實例，連接到 PostgreSQL 資料庫
const sequelize = new Sequelize('postgres', 'postgres', "ray58111", {
  host: 'localhost',
  dialect: 'postgres',
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
    // 定義 email 欄位，類型為字串，且不允許為空
  },
  phonenumber: {
    type: Sequelize.INTEGER,
    allowNull: false,
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
}, {
  tableName: 'users', // 指定資料庫表格名稱為 'users'
  timestamps: false, // 如果 users 表格沒有包含 createdAt 和 updatedAt 欄位，設為 false
});

// 定義 Friends 模型
const Friends = sequelize.define('Friends', {
  participants: Sequelize.INTEGER,
  // 定義 participants 欄位，類型為整數型別的陣列
  requestTo: Sequelize.INTEGER,
  // 定義 requestTo 欄位，類型為整數
  accepted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    // 定義 accepted 欄位，類型為布林型別，默認值為 false
  },
});

// 建立 Friends 模型與 User 模型之間的關聯
Friends.belongsTo(users, { foreignKey: 'requestTo', as: 'requestedUser' });
Friends.belongsTo(users, { foreignKey: 'participants', as: 'participantUser' });

// 同步資料庫，創建或更新表格
Friends.sync({ force: false });

// 導出 Friends 模型
module.exports = Friends;
