const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          ref: 'Item',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
},
{ timestamps: true }
);

UserSchema.methods.addToCart = function(item) {
  const cartItemIndex = this.cart.items.findIndex(cartItem => {
    return cartItem.itemId.toString() === item._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartItemIndex >= 0) {
    newQuantity = this.cart.items[cartItemIndex].quantity + 1;
    updatedCartItems[cartItemIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      itemId: item._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

UserSchema.methods.removeFromCart = function(itemId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.itemId.toString() !== itemId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

UserSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
