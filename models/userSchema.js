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
    tasks: [
      {
        taskId: {
          type: Schema.Types.ObjectId,
          ref: 'Task',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
},
{ timestamps: true }
);

UserSchema.methods.addToCart = function(task) {
  const cartTaskIndex = this.cart.tasks.findIndex(cartTask => {
    return cartTask.taskId.toString() === task._id.toString();
  });
  let newQuantity = 1;
  const updatedCartTasks = [...this.cart.tasks];

  if (cartTaskIndex >= 0) {
    newQuantity = this.cart.tasks[cartTaskIndex].quantity + 1;
    updatedCartTasks[cartTaskIndex].quantity = newQuantity;
  } else {
    updatedCartTasks.push({
      taskId: task._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    tasks: updatedCartTasks
  };
  this.cart = updatedCart;
  return this.save();
};

UserSchema.methods.removeFromCart = function(taskId) {
  const updatedCartTasks = this.cart.tasks.filter(task => {
    return task.taskId.toString() !== taskId.toString();
  });
  this.cart.tasks = updatedCartTasks;
  return this.save();
};

UserSchema.methods.clearCart = function() {
  this.cart = { tasks: [] };
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
