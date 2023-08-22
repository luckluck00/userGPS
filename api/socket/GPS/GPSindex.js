const userGPS = require('../../models/userGPS');
const moment = require('moment');

class GPSSocketHander{
    connect() {
        
    }

    getLocation(){
        return userGPS.find();
    }

    sendLocation(data){
        const user = new userGPS({
            latitude: data.latitude,
            longitude: data.longitude,
            email:data.token,
          });
          user.save()
        .then(() => {
          console.log('Location data saved to MongoDB!');

        })
        .catch((err) => {
          console.error(err);
        });
    }
}

module.exports = GPSSocketHander;