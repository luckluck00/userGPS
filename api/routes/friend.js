const { Router } = require('express');
const FriendController = require('../controllers/friend');
const checkAuth = require('../middleware/check-auth');
const router = Router();

router.post('/sendFriendRequest', FriendController.sendFriendReuqest);
router.get('/getFriendsReq', FriendController.getFriendsReq);
router.post('/checkReq' , FriendController.checkReq);
router.post('/denyReq' , FriendController.denyReq);
router.get('/getFriend' , FriendController.getFriend);
router.get('/getFriendAndMsg' , FriendController.getFriendAndMsg);


module.exports = router;