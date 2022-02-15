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

router.post ('/user/add-task',[body('title').isString().isLength({ min: 3 }).trim()],
  authController.isLogedIn,
  userController.postAddTask
);

router.post ('/user/edit-task',[body('title').isString().isLength({ min: 3 }).trim()],
  authController.isLogedIn,
  userController.postEditTask
);

router.post   ('/user/punchIn',                   authController.isLogedIn, userController.postPunchIn);
router.post   ('/user/punchOut',                  authController.isLogedIn, userController.postPunchOut);

// USER TIME TRACKER
router.get    ('/user/timetracker',               authController.isLogedIn, userController.getTimeTrackerView);

router.post   ('/user/timetracker',               authController.isLogedIn, userController.postTimeTracker);
router.post   ('/user/timetracker-delete-task',   authController.isLogedIn, userController.postRemoveTimeTrackerTask);

// USER ARCHIVE
router.post   ('/user/archive-task',            authController.isLogedIn, userController.postArchiveTask);
router.post   ('/user/archive/delete-task',     authController.isLogedIn, userController.deleteArchiveTask)
router.post   ('/user/archive/make-active',     authController.isLogedIn, userController.postMakeActive)
router.get    ('/user/archive',                 authController.isLogedIn, userController.getArchiveView);

module.exports = router;
