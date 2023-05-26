const express = require('express');
const Friends = require('../models/postgreSQL/Friend');

const sendFriendReuqest = async (req, res) => {
    try {
        const { requestTo, participants } = req.body;
    
        //好友請求
        const friendRequest = await Friends.create({
          requestTo,
          participants,
          accepted: false
        });
    
        res.status(200).json({ message: 'Friend request sent successfully' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: 'Server error' } });
      }
};

module.exports = {
    sendFriendReuqest,
}
