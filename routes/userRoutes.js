// INCLUDES
const APP_CWD         = process.cwd();
const express         = require('express');
const { body }        = require('express-validator/check');
const router          = express.Router();

// CONTROLLERS
const userController  = require(APP_CWD + '/controllers/userController');
const authController  = require(APP_CWD + '/controllers/authController');

// USER ITEMS
router.get  ('/user/task-list',           authController.isLogedIn, userController.getTasksView);
router.get  ('/user/add-task',            authController.isLogedIn, userController.getAddTaskView);
router.get  ('/user/edit-task/:taskId',   authController.isLogedIn, userController.getEditTaskView);

router.post ('/user/add-task',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ],
  authController.isLogedIn,
  userController.postAddTask
);

router.post ('/user/edit-task',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ],
  authController.isLogedIn,
  userController.postEditTask
);

router.delete ('/user/delete-task/:taskId', authController.isLogedIn, userController.deleteTask);

// USER CART
router.get    ('/user/timetracker',               authController.isLogedIn, userController.getTimeTrackerView);

router.post   ('/user/timetracker',               authController.isLogedIn, userController.postTimeTracker);
router.post   ('/user/timetracker-delete-task',   authController.isLogedIn, userController.postRemoveTimeTrackerTask);

// USER CHECKOUT
router.get    ('/user/checkout',           authController.isLogedIn, userController.getCheckoutView);
router.get    ('/user/checkout/success',   userController.getCheckoutSuccess);
router.get    ('/user/checkout/cancel',    userController.getCheckoutView);

// USER ORDERS
router.get    ('/user/orders',              authController.isLogedIn, userController.getOrdersView);
router.get    ('/user/orders/:orderId',     authController.isLogedIn, userController.getInvoiceView);

module.exports = router;
