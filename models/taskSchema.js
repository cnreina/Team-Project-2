const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  totaltime: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timestart: {
    type: Date,
    required: true
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
