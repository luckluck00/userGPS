const Message = require('../../models/Messages');
const jwt = require('jsonwebtoken');
const { users, FriendsReq,Friends } = require('../../models/postgreSQL/Friend'); 
const moment = require('moment');

class MessagesSocketHead{
    connect(token) {
      //const token = data.token; // 取得 Bearer token  
      // 将 token 解析成 payload
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      // 取得 payload 中的 id
      const userEmail = decoded.email;
      return userEmail;
    }

  async getMessage(data) {
      const token1 = data.token;
      const friendEmail1 = data.friendEmail;
      // 将 token 解析成 payload
      const decoded = jwt.verify(token1, process.env.JWT_KEY);
      // 取得 payload 中的 Email
      const userEmail = decoded.email;
      console.log(userEmail,friendEmail1)
      try {
        const messages = await Message.find({
          $or: [
            { $and: [{ email: userEmail }, { friendEmail: friendEmail1 }] },
            { $and: [{ email: friendEmail1 }, { friendEmail: userEmail }] }
        ]
        }).select('msg name time friendEmail');
        
        const formattedMessages = messages.map(message => ({
          msg: message.msg,
          name: message.name,
          time: message.time,
          friendEmail: message.friendEmail
        }));
          return { data: formattedMessages, success: true };
      } catch (err) {
          console.error(err);
          return { error: err.message, success: false };
      }
  }

  async sendMessage(data, socketID) {
    const token = data.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userEmail = decoded.email;

        const message = new Message({
            name: data.name,
            email: userEmail,
            msg: data.msg,
            time: moment().valueOf(),
            socketID: socketID,
            friendEmail: data.friendEmail,
        });

        const savedMessage = await message.save();
        
        console.log('Message data saved to MongoDB!');
        
        const formattedMessage = {
            msg: savedMessage.msg,
            name: savedMessage.name,
            time: savedMessage.time,
            friendEmail: savedMessage.friendEmail,
        };
        
        return { data: formattedMessage };
    } catch (err) {
        console.error(err);
        throw err; // 将错误重新抛出以便在调用代码中处理
    }
}

}

module.exports = MessagesSocketHead;