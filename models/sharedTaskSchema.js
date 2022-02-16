const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {TaskSchema} = require("./taskSchema")

const SharedTaskSchema = new Schema({
    title: {
        type: String,
        required: true
      },
    tasks: [TaskSchema],
},
{ timestamps: true }
);

module.exports = mongoose.model('SharedTask', SharedTaskSchema);
