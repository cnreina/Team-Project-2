const express           = require('express');
const APP_CWD           = process.cwd();
const storeController   = require(APP_CWD + '/controllers/storeController');
const router            = express.Router();

router.get('/store/task-list',            storeController.getTasksView);
router.get('/store/task-list/:taskId',    storeController.getTaskView);

module.exports = router;
