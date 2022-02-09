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
    body('description').isLength({ min: 5, max: 400 }).trim()
  ],
  authController.isLogedIn,
  userController.postAddTask
);

router.post ('/user/edit-task',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ],
  authController.isLogedIn,
  userController.postEditTask
);

router.delete ('/user/delete-task/:taskId', authController.isLogedIn, userController.deleteTask);

// USER TIME TRACKER
router.get    ('/user/timetracker',               authController.isLogedIn, userController.getTimeTrackerView);

router.post   ('/user/timetracker',               authController.isLogedIn, userController.postTimeTracker);
router.post   ('/user/timetracker-delete-task',   authController.isLogedIn, userController.postRemoveTimeTrackerTask);

// USER CHECKOUT
router.get    ('/user/checkout',           authController.isLogedIn, userController.getCheckoutView);
router.get    ('/user/checkout/success',   userController.getCheckoutSuccess);
router.get    ('/user/checkout/cancel',    userController.getCheckoutView);

// USER ARCHIVE
router.get    ('/user/archive',              authController.isLogedIn, userController.getArchiveView);
router.get    ('/user/archive/:archiveId',     authController.isLogedIn, userController.getArchivedTaskView);

module.exports = router;
