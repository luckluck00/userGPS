const { Router } = require('express');
const { Server } = require("socket.io");
const userGPS = require('../models/userGPS');
// otherEvents.js
const io = require('socket.io');
//const Customer = mongoose.model('customer', userSchema);

const getUserGPS = (io) => (socket) => {

    socket.on('connect', () => {
      console.log('Client connected with id:', socket.id);
    });

    console.log('A client connected!');

    // Listen for location updates from the client
    socket.on('sendLocation', (data) => {
      // Save the location data to Mongoose
      const user = new userGPS({
        latitude: data.latitude,
        longitude: data.longitude,
      });
      user.save()
        .then(() => {
          console.log('Location data saved to MongoDB!');
          socket.emit('locationSaved', { message: 'Location data saved to MongoDB!' });

        })
        .catch((err) => {
          console.error(err);
          socket.emit('locationSaveError', { message: 'Error saving location data to MongoDB.' });

        });
    });

};

module.exports = { getUserGPS };