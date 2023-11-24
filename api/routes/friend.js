const { Router } = require('express');
const FriendController = require('../controllers/friend');
const checkAuth = require('../middleware/check-auth');
const router = Router();

router.post('/sendFriendRequest', FriendController.sendFriendReuqest);
router.get('/getFriendsReq', FriendController.getFriendsReq);
router.post('/checkReq' , FriendController.checkReq);
router.delete('/denyReq' , FriendController.denyReq);
router.get('/getFriend' , FriendController.getFriend);
router.get('/getFriendAndMsg' , FriendController.getFriendAndMsg);
router.delete('/denyFriend' ,FriendController.denyFriend);


module.exports = router;
