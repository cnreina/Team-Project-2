const express           = require('express');
const APP_CWD           = process.cwd();
const storeController   = require(APP_CWD + '/controllers/storeController');
const router            = express.Router();

router.get('/store/item-list',            storeController.getItemsView);
router.get('/store/item-list/:itemId',    storeController.getItemView);

module.exports = router;
