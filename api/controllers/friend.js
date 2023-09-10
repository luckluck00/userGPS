const express = require('express');
const jwt = require('jsonwebtoken');
const { users, FriendsReq,Friends } = require('../models/postgreSQL/Friend'); 
const path = require('path');
const fs = require('fs');


const sendFriendReuqest = async (req, res) => {
    const friendEmail  = req.body.email;
    const user = await users.findOne({ where: { email:friendEmail } });
    //const userFriend = await FriendsReq.findOne({ where: { requestTo:firendEmail } });

    if(!user)
    {
      return res.status(404).json({ error: { message: 'Email not found in the database' } });
    }
    /*else if(userFriend)
    {
      return res.status(404).json({ error: { message: 'Email has been sent' } });
    }*/
    else{
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
        const userId = decoded.id;
        const userFriend = await FriendsReq.findOne({ where: { requestTo: friendEmail, participants: userId } });
        if(userFriend)
        {
          return res.status(404).json({ error: { message: 'Email has been sent' } });
        }


        //好友請求
        const friendRequest = await FriendsReq.create({
          participants: userId,
          requestTo: friendEmail, 
          accepted: false
        });
  
        res.status(200).json({ 
          message: 'Friend request sent successfully',
          friendRequest
        });
      } 
    catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: 'Server error' } });
      }
    } 
};

const getFriendsReq = async (req ,res) => {
  try {
    const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: { message: 'Authorization header missing' } });
        }
    const token = authHeader.split(' ')[1]; // 取得 Bearer token  
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userId = decoded.id;
    const user = await users.findOne({ where: { id:userId } });
    const userEmail = user.email;

    const userFriend = await FriendsReq.findAll({
       where: { requestTo:userEmail , accepted: false},
       include: {
        model: users,
        as: 'participantUser',
        attributes: ['img_path', 'name', 'email']
       }
      
      });

      //const participants = userFriend.map(friend => friend.participantUser);

      const filePromises = userFriend.map(async (friend) => {
        const imgPath = friend.participantUser.img_path;
        const filePath = path.join(__dirname, imgPath);
        const fileContent = await fs.promises.readFile(filePath);
        return {
          //imgPath,
          fileContent
        };
      });
  
      const userNamePromises = userFriend.map(async (friend) => {
        const username = friend.participantUser.name;
        return {
          username
        };
      });

      const friendEmailPromises = userFriend.map(async (friend) => {
        const friendemail = friend.participantUser.email;
        return {
          friendemail
        };
      });
  
      const [userImage, userName, friendEmail] = await Promise.all([Promise.all(filePromises), Promise.all(userNamePromises), Promise.all(friendEmailPromises)]);
  
      res.status(200).json({
        message: 'Friend request sent successfully',
        userName,
        userImage,
        friendEmail,
      });

  } catch (error) {
        console.error(error);
        res.status(500).json({ error: { message: 'Server error' } });
  }
}

const checkReq = async (req ,res) => {
try {
    const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: { message: 'Authorization header missing' } });
        }
    const token = authHeader.split(' ')[1]; // 取得 Bearer token  
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const tokenUserId = decoded.id;
    const user = await users.findOne({ where: { id:tokenUserId } });
    const userEmail = user.email;
    friendEmail = req.body.email;
    const friend = await users.findOne({ where: { email:friendEmail } });
    const friendId = await friend.id;

    const updateFriendsReq = await FriendsReq.findOne({
      where: {
        participants: friendId,
        requestTo: userEmail
      }
    });
    if (updateFriendsReq) {
      await updateFriendsReq.update({
        accepted: true
      });
    }
    //console.log(friendEmail);
    const createFriends = await Friends.create({
      userId: tokenUserId,
      friends: friendEmail, 
    });
    const createFriends2 = await Friends.create({
      userId: friendId,
      friends: userEmail, 
    });
    res.status(200).json({
      message: 'Friend create successfully',
    })
    console.log(createFriends, createFriends2,updateFriendsReq);



} catch (error) {
    console.error(error);
      res.status(500).json({ error: { message: 'Server error' } });
  
  }
}

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
      const tokenUserId = decoded.id;
      const user = await users.findOne({ where: { id:tokenUserId } });
      const userEmail = user.email;
      friendEmail = req.body.email;
      const friend = await users.findOne({ where: { email:friendEmail } });
      const friendId = await friend.id;
      const deleteFriendsReq = await FriendsReq.findOne({
        where: {
          participants: friendId,
          requestTo: userEmail
        }
      });
      if (deleteFriendsReq) {
        await deleteFriendsReq.destroy().then(() => {
          console.log('destroy done!')
        })
      }
      res.status(200).json({
        message: 'FriendReq deny successfully',
      })

      
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { message: 'Server error' } });
  }
}

const getFriend = async (req , res) => {
  try {
    const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: { message: 'Authorization header missing' } });
        }
    const token = authHeader.split(' ')[1]; // 取得 Bearer token  
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userId = decoded.id;
    const user = await users.findOne({ where: { id:userId } });
    const userEmail = user.email;

    const userFriend = await Friends.findAll({
       where: { userId:userId},
       include: {
        model: users,
        as: 'friendsUser',
        attributes: ['img_path', 'name', 'email']
       }
      
      });

      //const participants = userFriend.map(friend => friend.participantUser);

      const filePromises = userFriend.map(async (friend) => {
        const imgPath = friend.friendsUser.img_path;
        const filePath = path.join(__dirname, imgPath);
        const fileContent = await fs.promises.readFile(filePath);
        return {
          //imgPath,
          fileContent
        };
      });
  
      const userNamePromises = userFriend.map(async (friend) => {
        const username = friend.friendsUser.name;
        return {
          username
        };
      });

      const friendEmailPromises = userFriend.map(async (friend) => {
        const friendemail = friend.friendsUser.email;
        return {
          friendemail
        };
      });
  
      const [userImage, userName, friendEmail] = await Promise.all([Promise.all(filePromises), Promise.all(userNamePromises), Promise.all(friendEmailPromises)]);
  
      res.status(200).json({
        message: 'Friend sent successfully',
        userName,
        userImage,
        friendEmail,
      });

  } catch (error) {
        console.error(error);
        res.status(500).json({ error: { message: 'Server error' } });
  }
}


module.exports = {
    sendFriendReuqest,getFriendsReq,checkReq, denyReq, getFriend
}
