const express           = require('express');
const APP_CWD           = process.cwd();
const shareController   = require(APP_CWD + '/controllers/shareController');
const router            = express.Router();

router.get('/share/task-list',            shareController.getTasksView);
router.get('/share/task-list/:taskId',    shareController.getTaskView);

module.exports = router;
