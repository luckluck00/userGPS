const pool = require('../../db');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const queries = require('../queries/queries');
const WebCrypto = require('../help/WebCrypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { error } = require('console');
const { users, FriendsReq,Friends } = require('../models/postgreSQL/Friend'); 
const UserGPS = require('../models/userGPS');

const getUsers = (req, res) => {
  pool.query(queries.getUsers, (error, results) => {
        if (error) {
            console.log(error);
            res.status(404).send("伺服器錯誤");
          } else {
            console.log(results);
            res.status(200).json(results.rows);
          }
    });
};


const User_signup = async (req, res, next) => {
  const { email, phonenumber, password, dob } = req.body;

  try {
      // Check if email exists
      const emailCheckResult = await pool.query(queries.checkEmailExists, [email]);
      if (emailCheckResult.rows.length) {
          return res.status(404).json({ message: "email存在" });
      }

      // Hash password
      const hash = await bcrypt.hash(password, 10);

      // Add user to db
      const createUserResult = await pool.query(queries.CreatUser, [email, phonenumber, hash, dob]);

      // Retrieve userId from the result
      const userId = createUserResult.rows[0].id;

      // Generate JWT token
      const token = jwt.sign({ id: userId, email: email }, process.env.JWT_KEY);

      // Create and save UserGPS record
      const userGPS = new UserGPS({ latitude: 0, longitude: 0, userId: userId });
      const userGPSResult = await userGPS.save();

      console.log(userGPSResult);

      res.status(201).json({ message: "User Created Successfully!", token, userId });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "伺服器錯誤" });
  }
};


const User_signup_nameAndPhoto = async (req , res , next) => {
  const { name } = req.body;
  const image = req.files.user_img.data;
  const timestamp = Date.now();
  const ext = path.extname(req.files.user_img.name);
  const filename = `${timestamp}${ext}`;
  /*const imageBuffer = await sharp(image)
  .resize({ width: 150, height: 150, fit: 'inside' })
  .toBuffer();*/

  // 寫入縮小且裁剪成圓形的圖片檔案
  const imagePath = path.join(__dirname, 'uploads', filename);
  fs.writeFileSync(imagePath, image);
  const imgPath = `uploads/${filename}`;

  pool.query(queries.CreateUser_name_photo, [name, imgPath, image],(error, results) => {
    if (error) {
      console.log(error);
      res.status(404).send("伺服器錯誤");
    } else {
      console.log(results);
      res.status(200).json(results.rows);
    }
  });  
};

const User_login = (req, res, next) => {
  const email = req.body.email;
  pool.query(queries.User_login, [email], (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
    if (results.rows.length === 0) {
      return res.status(401).json({
        message: "Authentication failed"
      });
    }
    pool.query(queries.getUserIdFromEmail, [email] , (error, results1) => {
      if(error){
        console.log(error);
        res.status(400).json("Not From Email");
      }
      const userId = results1.rows[0].id;
      const hashedPassword = results.rows[0].password;
      const userEmail = results.rows[0].email; // 从查询结果中获取用户id
      const token = jwt.sign({ id: userId, email: email}, process.env.JWT_KEY);

    bcrypt.compare(req.body.password, hashedPassword, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
            message: "Authentication failed"
        });
      }
      if (result) {
        // Passwords match, log user in
        res.status(200).json({
          message: "Authentication successful",
          token
        });
      } else {
        // Passwords don't match
        res.status(401).json({
          message: "Authentication failed"
        });
      }
    });
    });
  });
};

const User_Delete = (req, res, next) => {
  const id = parseInt(req.params.id);

  pool.query(queries.GetUserId, [id] , (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal server error");
      return;
    }
    const noUserFound = !results.rows.length;
    if(noUserFound){
      res.send("User does not exist in the database");
    }else{
      pool.query(queries.DeleteUser, [id] , (error, results) => {
        if (error) {
          console.log(error);
          res.status(404).send("伺服器錯誤");
        } else {
          console.log(results);
          res.status(201).send("User removed Successfully!");
        } 
      });
    }
  });
}

const User_getImg = async  (req , res , next) => {

  // 获取 Authorization Header 中的 Bearer Token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: { message: 'Authorization header missing' } });
  }

  const token = authHeader.split(' ')[1]; // 取得 Bearer token  
  try {
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userId = decoded.id;

    // 查询用户头像的文件路径
    const { rows } = await pool.query(queries.getUserImg, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const imagePath = path.join(__dirname, rows[0].img_path);

    // 读取头像图片文件
    const image = fs.readFileSync(imagePath);

    // 回传图片二进制流
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(image, 'binary');
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};

const User_getUserName = async  (req , res , next) => {

  // 获取 Authorization Header 中的 Bearer Token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: { message: 'Authorization header missing' } });
  }

  const token = authHeader.split(' ')[1]; // 取得 Bearer token  
  try {
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userId = decoded.id;
    // 查询用户头像的文件路径

    pool.query(queries.getUserName, [userId] , (error , results) => {
      if (error) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }
      else{
        const name = results.rows[0].name;
        res.status(200).json({
          name
        });
      }
    });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};

const User_ChangeUserName = async  (req , res , next) => {

  // 获取 Authorization Header 中的 Bearer Token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: { message: 'Authorization header missing' } });
  }

  const token = authHeader.split(' ')[1]; // 取得 Bearer token  
  try {
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userId = decoded.id;

    const NewName = req.body.name;

    pool.query(queries.ChangeUserName, [NewName,userId] , (error , results) => {
      if (error) {
        return res.status(404).json({ 
          error: { message: 'User not found' }});
      }
      else{
        res.status(201).json({
          message: "Get user name!" , NewName
        });
      }
    });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};

const User_ChangeUserImg = async  (req , res , next) => {

  // 获取 Authorization Header 中的 Bearer Token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: { message: 'Authorization header missing' } });
  }

  const token = authHeader.split(' ')[1]; // 取得 Bearer token  
  try {
    const image = req.files.user_img.data;
    const timestamp = Date.now();
    const ext = path.extname(req.files.user_img.name);
    const filename = `${timestamp}${ext}`;
    /*const imageBuffer = await sharp(image)
    .resize({ width: 150, height: 150, fit: 'inside' })
    .toBuffer();*/
    const imagePath = path.join(__dirname, 'uploads', filename);
    //fs.writeFileSync(imagePath, imageBuffer);
    const imgPath = `uploads/${filename}`;
  // 寫入縮小且裁剪成圓形的圖片檔案
  // 寫入縮小且裁剪成圓形的圖片檔案

    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userId = decoded.id;
    // 查询用户头像的文件路径

    pool.query(queries.ChangeUserImg, [imgPath,image,userId] , (error , results) => {
      if (error) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }
      else{
        const image = fs.readFileSync(imagePath);
        // 回传图片二进制流
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(image, 'binary');
      }
    });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};

const getNameFromEmail = async  (req , res , next) => {
  try {
    const {email} = req.body;
    pool.query(queries.getNameFromEmail, [email] , (error , results) => {
      if (error) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }
      else{
        const name = results.rows[0].name;
        res.json({
          name
        });
      }
    });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};

const getUserimgFromEmail = async  (req , res , next) => {
  try {
    const {email} = req.body;
    pool.query(queries.getUserimgFromEmail, [email] , (error , results) => {
      if (error) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }
      else{
        const imagePath = path.join(__dirname, results.rows[0].img_path);

        // 读取头像图片文件
        const image = fs.readFileSync(imagePath);
    
        // 回传图片二进制流
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(image, 'binary');
      }
    });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};

const User_getDriverState = async  (req , res , next) => {

  // 获取 Authorization Header 中的 Bearer Token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: { message: 'Authorization header missing' } });
  }

  const token = authHeader.split(' ')[1]; // 取得 Bearer token  
  try {
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userId = decoded.id;
    // 查询用户头像的文件路径
    const GetDriverState = await users.findOne({
      where: {id: userId},
      attributes: ['driverstate']
    })

    const driverState = GetDriverState.driverstate
    console.log(driverState);
    res.status(200).json({
      driverState // 返回包括所需字段的数组
    });


    

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { message: 'Token expired' } });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};


module.exports = {
    getUsers, User_signup, User_login, User_Delete, User_signup_nameAndPhoto , User_getImg, User_getUserName, User_ChangeUserName, User_ChangeUserImg, getNameFromEmail, getUserimgFromEmail, User_getDriverState
}