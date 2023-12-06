const express = require('express');
const Message = require('../models/Messages');
const jwt = require('jsonwebtoken');
const { users, FriendsReq, Friends } = require('../models/postgreSQL/Friend');
const { DriverReq: DriverRequestModel , Uber} = require('../models/postgreSQL/DriverReq');
const path = require('path');
const fs = require('fs');

const sendDriverRequest = async (req, res) => {
  try {
    //建立請求
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: { message: 'Authorization header missing' } });
    }
    const token = authHeader.split(' ')[1]; // 取得 Bearer token
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userEmail = decoded.email;
    const driverRequest = await DriverRequestModel.findOne({ where: { DriverEmail: userEmail } });

    /*if (driverRequest) {
      return res.status(404).json({ error: { message: 'Driver request has already been sent' } });
    }*/
    console.log(req.body.selectedTime)
    const selectedTime = req.body.selectedTime;

    //好友請求
    const DriverRequest = await DriverRequestModel.create({
      DriverEmail: userEmail,
      selectedTime : selectedTime,
      location: req.body.selectedLocation,
      message: req.body.message,
    });

    const updateUserDriverState = await users.findOne({
      where: {
        email: userEmail,
      },
    });
    if(updateUserDriverState){
      await updateUserDriverState.update({
        driverstate: true,
      })
    }

    res.status(200).json({
      message: 'Driver request sent successfully',
      DriverRequest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};

const getDriversReq = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: { message: 'Authorization header missing' } });
    }
    const token = authHeader.split(' ')[1]; // 取得 Bearer token
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userEmail = decoded.email;

    const userDrivers = await DriverRequestModel.findAll({
      where: { accepted: false },
      include: {
        model: users,
        as: 'DriverEmailUser',
        attributes: ['img_path', 'name', 'email'],
      },
      attributes: ['location', 'message', 'selectedTime'], // 添加需要的字段
    });

    const filePromises = userDrivers.map(async (driver) => {
      const imgPath = driver.DriverEmailUser.img_path;
      const filePath = path.join(__dirname, imgPath);
      const fileContent = await fs.promises.readFile(filePath);
      return {
        fileContent,
      };
    });

    const userNamePromises = userDrivers.map(async (driver) => {
      const username = driver.DriverEmailUser.name;
      return {
        username,
      };
    });

    const driverEmailPromises = userDrivers.map(async (driver) => {
      const driverEmail = driver.DriverEmailUser.email;
      return {
        driverEmail,
      };
    });

    const [userImage, userName, driverEmail] = await Promise.all([Promise.all(filePromises), Promise.all(userNamePromises), Promise.all(driverEmailPromises)]);

    // 使用 map 方法来只返回所需的字段
    const simplifiedUserDrivers = userDrivers.map((driver) => ({
      location: driver.location,
      message: driver.message,
      selectedTime: driver.selectedTime,
    }));
    console.log(userName, driverEmail, simplifiedUserDrivers)
    res.status(200).json({
      message: 'Driver request data retrieved successfully',
      userName,
      userImage,
      driverEmail,
      userDrivers: simplifiedUserDrivers, // 返回包括所需字段的数组
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};

const checkReq = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: { message: 'Authorization header missing' } });
    }
    const token = authHeader.split(' ')[1]; // 取得 Bearer token
    // 将 token解析成payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得payload中的id
    const userEmail = decoded.email;

    const driverEmail = req.body.email; // 从请求体中获取 driverEmail

    if (!driverEmail) {
      return res.status(400).json({ error: { message: 'Driver email missing in request body' } });
    }

    const updateDriverReq = await DriverRequestModel.findOne({
      where: {
        DriverEmail: driverEmail,
      },
    });

    if (updateDriverReq) {
      await updateDriverReq.destroy().then(() => {
        console.log('destroy done!')
      })
      const updateUserDriverState = await users.findOne({
        where: {
          email: userEmail,
        },
      });
      if(updateUserDriverState){
        await updateUserDriverState.update({
          driverstate: true,
        })
      }

      const CreateUber = await Uber.create({
        userEmail: userEmail,
        driverEmail: driverEmail,
      });

      res.status(200).json({
        message: 'Driver created successfully',
      });

      console.log(CreateUber, updateDriverReq);
    } else {
      res.status(404).json({
        error: { message: 'Driver request not found' },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
};
const denyReq = async (req , res) => {
  try {
    const authHeader = req.headers.authorization;
          if (!authHeader) {
            return res.status(401).json({ error: { message: 'Authorization header missing' } });
          }
      const token = authHeader.split(' ')[1]; // 取得 Bearer token  
      // 将 token 解析成 payload
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      // 取得 payload 中的 id
      const userEmail = decoded.email;
      const deleteDriverReq = await DriverRequestModel.findOne({
        where: {
          DriverEmail: userEmail
        }
      });
      if (deleteDriverReq) {
        await deleteDriverReq.destroy().then(() => {
          console.log('destroy done!')
        })
      }
      const updateUserDriverState = await users.findOne({
        where: {
          email: userEmail,
        },
      });
      if(updateUserDriverState){
        await updateUserDriverState.update({
          driverstate: false,
        })
        console.log('driverState update!')
      }

      res.status(200).json({
        message: 'driverReq deny successfully',
      })

      
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
}
  
  const denyUber = async (req , res) => {
    try {
      const authHeader = req.headers.authorization;
            if (!authHeader) {
              return res.status(401).json({ error: { message: 'Authorization header missing' } });
            }
        const token = authHeader.split(' ')[1]; // 取得 Bearer token  
        // 将 token 解析成 payload
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        // 取得 payload 中的 id
        const userEmail = decoded.email;
        driverEmail = req.body.email;
        const deleteUber = await Uber.findOne({
          where: {
            userEmail: userEmail,
            driverEmail: driverEmail
          }
        });
        if (deleteUber) {
          await deleteUber.destroy().then(() => {
            console.log('destroy done!')
          })
        }const deleteUber2 = await Uber.findOne({
          where: {
            userEmail: driverEmail,
            driverEmail: userEmail
          }
        });
        if (deleteUber2) {
          await deleteUber2.destroy().then(() => {
            console.log('destroy done!')
          })
        }
        const updateUserDriverState = await users.findOne({
          where: {
            email: userEmail,
          },
        });
        if(updateUserDriverState){
          await updateUserDriverState.update({
            driverstate: false,
          })
          console.log('driverState update!')
        }
        const updateUserDriverState2 = await users.findOne({
          where: {
            email: driverEmail,
          },
        });
        if(updateUserDriverState2){
          await updateUserDriverState2.update({
            driverstate: false,
          })
          console.log('driverState update!')
        }
        await Message.deleteMany({
          $or: [
            { $and: [{ email: userEmail }, { friendEmail: driverEmail }] },
            { $and: [{ email: driverEmail }, { friendEmail: userEmail }] }
          ]
        });
  
        console.log('UberMessage deny successfully');
        res.status(200).json({
          message: 'Uber deny successfully',
        })
  
        
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: { message: 'Server error' } });
    }
  }
  
  const getUber = async (req , res) => {
    try {
      const authHeader = req.headers.authorization;
          if (!authHeader) {
            return res.status(401).json({ error: { message: 'Authorization header missing' } });
          }
      const token = authHeader.split(' ')[1]; // 取得 Bearer token  
      // 将 token 解析成 payload
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      // 取得 payload 中的 id
      const userEmail = decoded.email;
      const getUber = await Uber.findOne({
        where: {userEmail: userEmail}
      })
      if(getUber){
        const getDriver = await Uber.findOne({
          where: {userEmail: userEmail},
          include: {
            model: users,
            as: 'driverEmailUser',
            attributes: ['img_path', 'name', 'email']
           }
        })
          const imgPath = getDriver.driverEmailUser.img_path;
          const filePath = path.join(__dirname, imgPath);
          const fileContent = await fs.promises.readFile(filePath);

        //取得姓名
        const driverName = getDriver.driverEmailUser.name;
  
        //取得好友Email
        const driverEmail = getDriver.driverEmailUser.email;

        res.status(200).json({
          message: 'Driver sent successfully',
          userName: driverName,
          userImage: fileContent,
          userEmail: driverEmail,
        });
      } else {
        const getUser = await Uber.findOne({
          where: {driverEmail: userEmail},
          include: {
            model: users,
            as: 'userEmailUser',
            attributes: ['img_path', 'name', 'email']
           }
        })
        const imgPath = getUser.userEmailUser.img_path;
        const filePath = path.join(__dirname, imgPath);
        const fileContent = await fs.promises.readFile(filePath);

      //取得姓名
      const driverName = getUser.userEmailUser.name;

      //取得好友Email
      const driverEmail = getUser.userEmailUser.email;
      console.log(driverName, driverEmail, fileContent);
      res.status(200).json({
        message: 'Driver sent successfully',
        userName: driverName,
        userImage: fileContent,
        userEmail: driverEmail,
      });
    }
    } catch (error) {
          console.error(error);
          res.status(500).json({ error: { message: 'Server error' } });
    }
  }

  
module.exports = {
  sendDriverRequest, getDriversReq, checkReq, denyReq, denyUber, getUber
};
