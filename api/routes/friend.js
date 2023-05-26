const { Router } = require('express');
const FriendController = require('../controllers/friend');
const checkAuth = require('../middleware/check-auth');
const router = Router();

router.get('/sendFriendRequest', FriendController.sendFriendReuqest);

module.exports = router;