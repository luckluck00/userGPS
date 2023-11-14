const { Router } = require('express');
const DriverController = require('../controllers/driver');
const checkAuth = require('../middleware/check-auth');
const router = Router();

router.post('/sendDriverRequest', DriverController.sendDriverRequest);
router.get('/getDriversReq', DriverController.getDriversReq);
router.post('/checkReq' , DriverController.checkReq);
router.post('/denyUber', DriverController.denyUber);
router.get('/getUber', DriverController.getUber);


module.exports = router;