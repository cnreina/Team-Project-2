const express           = require('express');
const APP_CWD           = process.cwd();
const router            = express.Router();
const { body }        = require('express-validator/check');
const shareController   = require(APP_CWD + '/controllers/shareController');
const authController  = require(APP_CWD + '/controllers/authController');


router.get('/share/task-list',   authController.isLogedIn,         shareController.getTasksView);
router.get('/share/edit-task/:taskId/:masterTaskId',   authController.isLogedIn,         shareController.getEditSharedTaskView);
router.get('/share/add-shared-task',            shareController.getAddSharedTaskView);

router.post('/share/edit-task',   authController.isLogedIn,         shareController.postEditSharedTask);
router.post ('/share/add-shared-task',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('description').isLength({ min: 3, max: 400 }).trim()
  ],
  authController.isLogedIn,
  shareController.postAddSharedTask
);

router.get('/share/delete-task/:taskId/:masterTaskId',   authController.isLogedIn,         shareController.deleteSharedTask);

module.exports = router;
