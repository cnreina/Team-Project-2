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
  timetracker: {
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

UserSchema.methods.addToTimeTracker = function(task) {
  const timetrackerTaskIndex = this.timetracker.tasks.findIndex(timetrackerTask => {
    return timetrackerTask.taskId.toString() === task._id.toString();
  });
  let newQuantity = 1;
  const updatedTimeTrackerTasks = [...this.timetracker.tasks];

  if (timetrackerTaskIndex >= 0) {
    newQuantity = this.timetracker.tasks[timetrackerTaskIndex].quantity + 1;
    updatedTimeTrackerTasks[timetrackerTaskIndex].quantity = newQuantity;
  } else {
    updatedTimeTrackerTasks.push({
      taskId: task._id,
      quantity: newQuantity
    });
  }
  const updatedTimeTracker = {
    tasks: updatedTimeTrackerTasks
  };
  this.timetracker = updatedTimeTracker;
  return this.save();
};

UserSchema.methods.removeFromTimeTracker = function(taskId) {
  const updatedTimeTrackerTasks = this.timetracker.tasks.filter(task => {
    return task.taskId.toString() !== taskId.toString();
  });
  this.timetracker.tasks = updatedTimeTrackerTasks;
  return this.save();
};

UserSchema.methods.clearTimeTracker = function() {
  this.timetracker = { tasks: [] };
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
