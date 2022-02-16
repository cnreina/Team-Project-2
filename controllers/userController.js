// INCLUDES
const mongoose              = require('mongoose');
const { validationResult }  = require('express-validator/check');
const fileObject            = require('fs');
const PDFDocument           = require('pdfkit');

const APP_CWD               = process.cwd();

const systemController      = require(APP_CWD + '/controllers/systemController');

const { TaskModel }                  = require(APP_CWD + '/models/taskSchema');
const Archive                 = require(APP_CWD + '/models/archiveSchema');
const SharedTask            = require("../models/sharedTaskSchema");

exports.getAddTaskView = (req, res, next) => {
  res.render('user/addTaskView', {
    pageTitle: 'Add Task',
    path: '/user/add-task',
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddTask = (req, res, next) => {
  const title       = req.body.title;
  const timestart   = req.body.timestart;
  const totaltime   = req.body.totaltime;
  const description = req.body.description;
  if (!timestart) {
    return res.status(422).render('user/addTaskView', {
      pageTitle: 'Add Task',
      path: '/user/add-task',
      hasError: true,
      Task: {
        title: title,
        totaltime: totaltime,
        description: description
      },
      errorMessage: 'ERROR: Time Start is required',
      validationErrors: []
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('user/addTaskView', {
      pageTitle: 'Add Task',
      path: '/user/add-task',
      hasError: true,
      Task: {
        title: title,
        totaltime: totaltime,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const task = new TaskModel({
    title:        title,
    totaltime:    totaltime,
    description:  description,
    timestart:    timestart,
    userId:       req.user
  });
  task.save().then(result => {
      res.redirect('/user/task-list');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postAddTask ERROR: ', error);
      return next(error);
    });
};

exports.getEditTaskView = (req, res, next) => {
  const taskId = req.params.taskId;
  TaskModel.findById(taskId).then(task => {
      if (!task) {
        console.log('getEditTaskView ERROR: ', task);
        return res.redirect('/');
      }
      res.render('user/editTaskView', {
        pageTitle:        'Edit Task',
        path:             '/user/edit-task',
        task:             task,
        hasError:         false,
        errorMessage:     null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getEditTaskView ERROR: ', error);
      return next(error);
    });
};

exports.postEditTask = (req, res, next) => {
  const taskId            = req.body.taskId;
  const updatedTitle      = req.body.title;
  const updatedTotalTime  = req.body.totaltime;
  const updatedTimeStart  = req.body.timestart;
  const updatedDesc       = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('user/editTaskView', {
      pageTitle:  'Edit Task',
      path:       '/user/edit-task',
      hasError:   true,
      task: {
        title:        updatedTitle,
        totaltime:    updatedTotalTime,
        description:  updatedDesc,
        _id:          taskId
      },
      errorMessage:     errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  TaskModel.findById(taskId).then(task => {
      if (task.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      task.title        = updatedTitle;
      task.totaltime    = updatedTotalTime;
      task.description  = updatedDesc;
      task.timestart    = updatedTimeStart;
      return task.save().then(result => {
        res.redirect('/user/task-list');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postEditTask ERROR: ', error);
      return next(error);
    });
};

exports.getTasksView = (req, res, next) => {
  TaskModel.find({ userId: req.user._id }).then(tasks => {
      res.render('user/tasksView', {
        tasks: tasks,
        pageTitle: 'User Tasks',
        path: '/user/task-list'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getTasksView ERROR: ', error);
      return next(error);
    });
};

exports.deleteTask = (req, res, next) => {
  const taskId = req.params.taskId;
  TaskModel.findById(taskId).then(task => {
      if (!task) {
        console.log('deleteTask ERROR: ', task);
        return next(new Error('Task not found.'));
      }
      return Task.deleteOne({ _id: taskId, userId: req.user._id });
    })
    .then(() => {
      res.status(200).json({ message: 'Success' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Task delete failed' });
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('deleteTask ERROR: ', error);
      return next(error);
    });
};

exports.getTaskListView = (req, res, next) => {
  req.user.populate('tasklist.tasks.taskId').execPopulate().then(user => {
      const tasks = user.tasklist.tasks;
      if (!tasks) {return next();};
      res.render('user/tasklistView', {
        path: '/user/tasklist',
        pageTitle: 'TaskList',
        tasks: tasks
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getTaskListView ERROR: ', error);
      return next(error);
    });
};

exports.postTaskList = (req, res, next) => {
  const taskId = req.body.taskId;
  TaskModel.findById(taskId).then(task => {
      return req.user.addToTaskList(task);
    })
    .then(result => {
      res.redirect('/user/tasklist');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postTaskList ERROR: ', error);
      return next(error);
    });
};

exports.postRemoveTaskListTask = (req, res, next) => {
  const tasklistTaskId = req.body.taskId;
  req.user.removeFromTaskList(tasklistTaskId).then(result => {
      res.redirect('/user/tasklist');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postRemoveTaskListTask ERROR: ', error);
      return next(error);
    });
};

exports.getArchiveView = (req, res, next) => {
  Archive.find({'user.userId': req.user._id}).then(archive => {
      res.render('user/archivedTasksView', {
        path: '/user/archive',
        pageTitle: 'Archive',
        archive: archive
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getArchiveView ERROR: ', error);
      return next(error);
    });
};

exports.postArchiveTask = (req, res, next) => {
  req.user.populate('tasklist.tasks.taskId').execPopulate().then(user => {
      const tasks = user.tasklist.tasks.map(task => {
        return {
          quantity: task.quantity,
          task: { ...task.taskId._doc }
        };
      });
      const archive = new Archive({
        user: {
          email:  req.user.email,
          userId: req.user
        },
        tasks: tasks
      });
      return archive.save();
    })
    .then(result => {
      return req.user.clearTaskList();
    })
    .then(() => {
      res.redirect('/user/archive');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postArchiveTask ERROR: ', error);
      return next(error);
    });
};

exports.getArchivedTaskView = (req, res, next) => {
  const archiveId = req.params.archiveId;
  Archive.findById(archiveId).then(archive => {
    if (!archive) {
      console.log('getArchivedTaskView ERROR: ', archive);
      return next(new Error('Archive not found'));
    }
    if (archive.user.userId.toString() !== req.user._id.toString()) {
      console.log('getArchivedTaskView ERROR: Unauthorized');
      return next(new Error('Unauthorized'));
    }
    
    res.render('user/archivedTaskView', {
      pageTitle:        'ArchivedTask',
      path:             '/user/archive',
      archive:            archive,
      hasError:         false,
      errorMessage:     null,
      validationErrors: []
    });
  });
};
