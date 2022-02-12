const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  totaltime: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  timestart: {
    type: Date,
    required: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
