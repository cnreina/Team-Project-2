// INCLUDES
const APP_CWD         = process.cwd();
const express         = require('express');
const { body }        = require('express-validator/check');
const router          = express.Router();

// CONTROLLERS
const userController  = require(APP_CWD + '/controllers/userController');
const authController  = require(APP_CWD + '/controllers/authController');

// USER ITEMS
router.get  ('/user/item-list',           authController.isLogedIn, userController.getItemsView);
router.get  ('/user/add-item',            authController.isLogedIn, userController.getAddItemView);
router.get  ('/user/edit-item/:itemId',   authController.isLogedIn, userController.getEditItemView);

router.post ('/user/add-item',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ],
  authController.isLogedIn,
  userController.postAddItem
);

router.post ('/user/edit-item',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ],
  authController.isLogedIn,
  userController.postEditItem
);

router.delete ('/user/delete-item/:itemId', authController.isLogedIn, userController.deleteItem);

// USER CART
router.get    ('/user/cart',               authController.isLogedIn, userController.getCartView);

router.post   ('/user/cart',               authController.isLogedIn, userController.postCart);
router.post   ('/user/cart-delete-item',   authController.isLogedIn, userController.postRemoveCartItem);

// USER CHECKOUT
router.get    ('/user/checkout',           authController.isLogedIn, userController.getCheckoutView);
router.get    ('/user/checkout/success',   userController.getCheckoutSuccess);
router.get    ('/user/checkout/cancel',    userController.getCheckoutView);

// USER ORDERS
router.get    ('/user/orders',              authController.isLogedIn, userController.getOrdersView);
router.get    ('/user/orders/:orderId',     authController.isLogedIn, userController.getInvoiceView);

module.exports = router;
