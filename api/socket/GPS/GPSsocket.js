const GPSSocketHander = require('./GPSindex');
const io = require('socket.io');

const getUserGPS = (io) => (socket) => {
  console.log('Client connected with id:', socket.id);

  const gpsSocketHandler = new GPSSocketHander();
  gpsSocketHandler.connect();

  socket.on('sendLocation', (data) => {
    gpsSocketHandler.sendLocation(data)
      try{
        socket.emit('locationSaved', data, { message: 'Location data saved to MongoDB!' });
      }
      catch(err) {
        console.error(err);
        socket.emit('locationSaveError', { message: 'Error saving location data to MongoDB.' });
      };
  });
};

module.exports = { getUserGPS };