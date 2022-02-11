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
  tasklist: {
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

UserSchema.methods.addToTaskList = function(task) {
  const tasklistTaskIndex = this.tasklist.tasks.findIndex(tasklistTask => {
    return tasklistTask.taskId.toString() === task._id.toString();
  });
  let newQuantity = 1;
  const updatedTaskListTasks = [...this.tasklist.tasks];

  if (tasklistTaskIndex >= 0) {
    newQuantity = this.tasklist.tasks[tasklistTaskIndex].quantity + 1;
    updatedTaskListTasks[tasklistTaskIndex].quantity = newQuantity;
  } else {
    updatedTaskListTasks.push({
      taskId: task._id,
      quantity: newQuantity
    });
  }
  const updatedTaskList = {
    tasks: updatedTaskListTasks
  };
  this.tasklist = updatedTaskList;
  return this.save();
};

UserSchema.methods.removeFromTaskList = function(taskId) {
  const updatedTaskListTasks = this.tasklist.tasks.filter(task => {
    return task.taskId.toString() !== taskId.toString();
  });
  this.tasklist.tasks = updatedTaskListTasks;
  return this.save();
};

UserSchema.methods.clearTaskList = function() {
  this.tasklist = { tasks: [] };
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
