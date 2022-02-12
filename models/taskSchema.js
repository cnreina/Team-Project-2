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
  timeStart: {
    type: Number,
    required: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  archived: {
    type: Boolean,
    required: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
