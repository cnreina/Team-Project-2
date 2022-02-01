/*	enable timestamps 
  Mongoose adds createdAt and updatedAt properties to your schema.
  By default, createdAt and updatedAt are of type Date.
  When you update a document, Mongoose automatically increments updatedAt.

  Property: { timestamps: true }

  https://mongoosejs.com/docs/guide.html#timestamps
*/

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  items: [
    {
      item: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
},
{ timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
