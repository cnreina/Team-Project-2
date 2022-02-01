const express           = require('express');
const APP_CWD           = process.cwd();
const homeController    = require(APP_CWD + '/controllers/homeController');
const router            = express.Router();

router.get('/',         homeController.getHomeView);

module.exports = router;
