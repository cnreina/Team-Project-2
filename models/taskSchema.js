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
  hours: {
    type: Number,
    required: false
  },
  minutes: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: false
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
