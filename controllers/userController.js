// INCLUDES
const mongoose              = require('mongoose');
const { validationResult }  = require('express-validator/check');
const fileObject            = require('fs');
const PDFDocument           = require('pdfkit');

const STRYPE_API_KEY        = 'sk_test_51KKD1BAuTVk1SDPGF8v9dXfkoHYb6aSilj7zinWcTDX96Evf937kZ3yq0bOrsL1M98bIO4ObOwvpyRjXg0uDttFj00GpNAE9On';
const stripe                = require('stripe')(STRYPE_API_KEY);

const APP_CWD               = process.cwd();

const systemController      = require(APP_CWD + '/controllers/systemController');

const Item                  = require(APP_CWD + '/models/itemSchema');
const Order                 = require(APP_CWD + '/models/orderSchema');

exports.getAddItemView = (req, res, next) => {
  res.render('user/addItemView', {
    pageTitle: 'Add Item',
    path: '/user/add-item',
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddItem = (req, res, next) => {
  const title       = req.body.title;
  const imageUrl    = req.body.imageUrl;
  const price       = req.body.price;
  const description = req.body.description;
  if (!imageUrl) {
    return res.status(422).render('user/addItemView', {
      pageTitle: 'Add Item',
      path: '/user/add-item',
      hasError: true,
      Item: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'ERROR: Image Url is required',
      validationErrors: []
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('user/addItemView', {
      pageTitle: 'Add Item',
      path: '/user/add-item',
      hasError: true,
      Item: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const item = new Item({
    title:        title,
    price:        price,
    description:  description,
    imageUrl:     imageUrl,
    userId:       req.user
  });
  item.save().then(result => {
      res.redirect('/user/item-list');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postAddItem ERROR: ', error);
      return next(error);
    });
};

exports.getEditItemView = (req, res, next) => {
  const itemId = req.params.itemId;
  Item.findById(itemId).then(item => {
      if (!item) {
        console.log('getEditItemView ERROR: ', item);
        return res.redirect('/');
      }
      res.render('user/editItemView', {
        pageTitle:        'Edit Item',
        path:             '/user/edit-item',
        item:             item,
        hasError:         false,
        errorMessage:     null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getEditItemView ERROR: ', error);
      return next(error);
    });
};

exports.postEditItem = (req, res, next) => {
  const itemId            = req.body.itemId;
  const updatedTitle      = req.body.title;
  const updatedPrice      = req.body.price;
  const updatedImageUrl   = req.body.imageUrl;
  const updatedDesc       = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('user/editItemView', {
      pageTitle:  'Edit Item',
      path:       '/user/edit-item',
      hasError:   true,
      item: {
        title:        updatedTitle,
        price:        updatedPrice,
        description:  updatedDesc,
        _id:          itemId
      },
      errorMessage:     errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Item.findById(itemId).then(item => {
      if (item.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      item.title        = updatedTitle;
      item.price        = updatedPrice;
      item.description  = updatedDesc;
      item.imageUrl     = updatedImageUrl;
      return item.save().then(result => {
        res.redirect('/user/item-list');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postEditItem ERROR: ', error);
      return next(error);
    });
};

exports.getItemsView = (req, res, next) => {
  Item.find({ userId: req.user._id }).then(items => {
      res.render('user/itemsView', {
        items: items,
        pageTitle: 'User Items',
        path: '/user/item-list'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getItemsView ERROR: ', error);
      return next(error);
    });
};

exports.deleteItem = (req, res, next) => {
  const itemId = req.params.itemId;
  Item.findById(itemId).then(item => {
      if (!item) {
        console.log('deleteItem ERROR: ', item);
        return next(new Error('Item not found.'));
      }
      return Item.deleteOne({ _id: itemId, userId: req.user._id });
    })
    .then(() => {
      res.status(200).json({ message: 'Success' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Item delete failed' });
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('deleteItem ERROR: ', error);
      return next(error);
    });
};

exports.getCartView = (req, res, next) => {
  req.user.populate('cart.items.itemId').execPopulate().then(user => {
      const items = user.cart.items;
      if (!items) {return next();};
      res.render('user/cartView', {
        path: '/user/cart',
        pageTitle: 'Cart',
        items: items
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getCartView ERROR: ', error);
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const itemId = req.body.itemId;
  Item.findById(itemId).then(item => {
      return req.user.addToCart(item);
    })
    .then(result => {
      res.redirect('/user/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postCart ERROR: ', error);
      return next(error);
    });
};

exports.postRemoveCartItem = (req, res, next) => {
  const cartItemId = req.body.itemId;
  req.user.removeFromCart(cartItemId).then(result => {
      res.redirect('/user/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postRemoveCartItem ERROR: ', error);
      return next(error);
    });
};

exports.getOrdersView = (req, res, next) => {
  Order.find({'user.userId': req.user._id}).then(orders => {
      res.render('user/ordersView', {
        path: '/user/orders',
        pageTitle: 'Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getOrdersView ERROR: ', error);
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.itemId').execPopulate().then(user => {
      const items = user.cart.items.map(item => {
        return {
          quantity: item.quantity,
          item: { ...item.itemId._doc }
        };
      });
      const order = new Order({
        user: {
          email:  req.user.email,
          userId: req.user
        },
        items: items
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/user/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postOrder ERROR: ', error);
      return next(error);
    });
};

exports.getCheckoutView = (req, res, next) => {
  let items;
  let totalPrice = 0;
  req.user.populate('cart.items.itemId').execPopulate().then(user => {
      items       = user.cart.items;
      totalPrice  = 0.00;
      items.forEach(item => {
        totalPrice += item.quantity * item.itemId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items:           items.map(item => {
          return {
            name:         item.itemId.title,
            description:  item.itemId.description,
            amount:       Math.round(item.itemId.price.toFixed(2)*100),
            currency:     'usd',
            quantity:     item.quantity
          };
        }),
        success_url:        req.protocol + '://' + req.get('host') + '/user/checkout/success',
        cancel_url:         req.protocol + '://' + req.get('host') + '/user/checkout/cancel'
      });
    })
    .then(session => {
      res.render('user/checkoutView', {
        path:       '/user/checkout',
        pageTitle:  'Checkout',
        items:      items,
        totalSum:   totalPrice,
        sessionId:  session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getCheckoutView ERROR: ', error);
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user.populate('cart.items.itemId').execPopulate().then(user => {
      const items = user.cart.items.map(item => {
        return {
          quantity:   item.quantity,
          item:       { ...item.itemId._doc }
        };
      });
      const order = new Order({
        user: {
          email:  req.user.email,
          userId: req.user
        },
        items:    items
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/user/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getCheckoutSuccess ERROR: ', error);
      return next(error);
    });
};

exports.getInvoiceView = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if (!order) {
      console.log('getInvoiceView ERROR: ', order);
      return next(new Error('Order not found'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      console.log('getInvoiceView ERROR: Unauthorized');
      return next(new Error('Unauthorized'));
    }
    
    res.render('user/invoiceView', {
      pageTitle:        'Invoice',
      path:             '/user/orders',
      order:            order,
      hasError:         false,
      errorMessage:     null,
      validationErrors: []
    });
  });
};
