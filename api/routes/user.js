const { Router } = require('express');
const UsersController = require('../controllers/user');
const checkAuth = require('../middleware/check-auth');
const router = Router();


router.get('/', UsersController.getUsers);
router.post('/signup', UsersController.User_signup);
router.post('/signup/nameAndphoto', UsersController.User_signup_nameAndPhoto);
router.post('/login', UsersController.User_login);
router.get('/getImg', UsersController.User_getImg);
router.delete('/:id',  UsersController.User_Delete);
router.get('/getUserName' , UsersController.User_getUserName);
router.post('/changeUserName' , UsersController.User_ChangeUserName);
router.post('/changeUserImg' , UsersController.User_ChangeUserImg);
router.post('/getNameFromEmail', UsersController.getNameFromEmail);
router.post('/getUserimgFromEmail', UsersController.getUserimgFromEmail);
router.get('/getDriverState', UsersController.User_getDriverState);


module.exports = router;