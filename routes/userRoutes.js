// INCLUDES
const APP_CWD         = process.cwd();
const express         = require('express');
const { body }        = require('express-validator/check');
const router          = express.Router();

// CONTROLLERS
const userController  = require(APP_CWD + '/controllers/userController');
const authController  = require(APP_CWD + '/controllers/authController');

// USER TASKS
router.get  ('/user/task-list',           authController.isLogedIn, userController.getTasksView);
router.get  ('/user/add-task',            authController.isLogedIn, userController.getAddTaskView);
router.get  ('/user/edit-task/:taskId',   authController.isLogedIn, userController.getEditTaskView);

router.post ('/user/add-task',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('totaltime').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ],
  authController.isLogedIn,
  userController.postAddTask
);

router.post ('/user/edit-task',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('totaltime').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ],
  authController.isLogedIn,
  userController.postEditTask
);

router.delete ('/user/delete-task/:taskId', authController.isLogedIn, userController.deleteTask);

// USER TIME TRACKER
router.get    ('/user/tasklist',               authController.isLogedIn, userController.getTaskListView);

router.post   ('/user/tasklist',               authController.isLogedIn, userController.postTaskList);
router.post   ('/user/tasklist-delete-task',   authController.isLogedIn, userController.postRemoveTaskListTask);

// USER CHECKOUT
router.get    ('/user/checkout',           authController.isLogedIn, userController.getCheckoutView);
router.get    ('/user/checkout/success',   userController.getCheckoutSuccess);
router.get    ('/user/checkout/cancel',    userController.getCheckoutView);

// USER ARCHIVE
router.get    ('/user/archive',              authController.isLogedIn, userController.getarchivedTaskListView);
router.get    ('/user/archive/:archiveId',     authController.isLogedIn, userController.getArchivedTaskView);

module.exports = router;
