const GPSSocketHander = require('./GPSindex');
const io = require('socket.io');

const getUserGPS = (io) => (socket) => {
  console.log('Client connected with id:', socket.id);

  const gpsSocketHandler = new GPSSocketHander();
  socket.on('login', (token) => {
    const userEmail = gpsSocketHandler.connect(token);
    //console.log(userEmail); 
    socket.userEmail = userEmail;
    socket.join(userEmail);
    socket.emit('loggedIn', userEmail);
  });


  socket.on('sendLocation', async (data) => {
    const senderEmail = socket.userEmail;
    const GPS = await gpsSocketHandler.sendLocation(data)
    const recipientEmailArray = GPS.friendEmail;
      try{
        for(const recipientEmail of recipientEmailArray){
          socket.to(recipientEmail).emit('locationSaved', { sender: senderEmail ,data: GPS.data ,message: 'Location data saved to MongoDB!' });
          console.log(GPS.data,recipientEmail);
        }
      }
      catch(err) {
        console.error(err);
        socket.emit('locationSaveError', { message: 'Error saving location data to MongoDB.' });
      };
  });
};

module.exports = { getUserGPS };