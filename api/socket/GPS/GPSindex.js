const userGPS = require('../../models/userGPS');
const jwt = require('jsonwebtoken');
const { users, FriendsReq,Friends } = require('../../models/postgreSQL/Friend'); 
const moment = require('moment');
class GPSSocketHander{
  connect(token) {
    //const token = data.token; // 取得 Bearer token  
    // 将 token 解析成 payload
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // 取得 payload 中的 id
    const userEmail = decoded.email;
    return userEmail;
  }

    getLocation(){
        return userGPS.find();
    }

    async sendLocation(data){
      try{
        const token1 = data.token;
        // 将 token 解析成 payload
        const decoded = jwt.verify(token1, process.env.JWT_KEY);
        // 取得 payload 中的 Email
        const userEmail = decoded.email;
        const userId = decoded.id;
        const friendEmail = await Friends.findAll({
          where: { userId:userId},
         });
         const friendEmails = friendEmail.map(friend => friend.friends);
        console.log(userEmail);
          const userGPS1 = new userGPS({
              latitude: data.latitude,
              longitude: data.longitude,
              email:userEmail,
            });
          const saveUserGPS = await userGPS1.save();

          const formattedUserGPS = {
            latitude: saveUserGPS.latitude,
            longitude: saveUserGPS.longitude,
        };

        return { data: formattedUserGPS ,friendEmail: friendEmails};
      }
      catch(err){
        console.error(err);
        throw err; // 将错误重新抛出以便在调用代码中处理
      }

    }
}

module.exports = GPSSocketHander;