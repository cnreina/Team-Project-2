const APP_CWD       = process.cwd();
const { validationResult }  = require('express-validator/check');
const SharedTask            = require("../models/sharedTaskSchema");
const { TaskModel }         = require(APP_CWD + '/models/taskSchema');



const ITEMS_PER_PAGE = 20;
exports.getTasksView = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalTasks;
  SharedTask.find({ "tasks.userId": req.user._id }).countDocuments().then(tasksCount => {
      totalTasks = tasksCount;
      return SharedTask.find({ "tasks.userId": req.user._id }).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    })
    .then(tasks => {
      res.render('share/sharedTasksView', {
        tasks: tasks,
        userId: req.user._id,
        pageTitle: 'Tasks',
        path: '/share/task-list',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalTasks,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalTasks / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getTasksView ERROR: ', error);
      return next(error);
    });
};


exports.postAddSharedTask = (req, res, next) => {
  const sharedTaskTitle = req.body.sharedTaskTitle;
  const title       = req.body.title;
  const timestart   = req.body.timestart;
  const totaltime   = req.body.totaltime;
  const description = req.body.description;
  if (!timestart) {
    return res.status(422).render('share/addSharedTaskView', {
      pageTitle: 'Add Shared Task',
      path: '/share/add-shared-task',
      hasError: true,
      Task: {
        sharedTaskTitle: sharedTaskTitle,
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
    return res.status(422).render('share/addSharedTaskView', {
      pageTitle: 'Add Shared Task',
      path: '/share/add-shared-task',
      hasError: true,
      Task: {
        sharedTaskTitle: sharedTaskTitle,
        title: title,
        totaltime: totaltime,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
    const userTask = new TaskModel({
      title:        title,
      totaltime:    totaltime,
      description:  description,
      timestart:    timestart,
      userId:       req.user
    });
    const sharedTask = new SharedTask({
      title: sharedTaskTitle,
      tasks: [userTask]
    });
    sharedTask.save().then(result => {
        res.redirect('/share/task-list');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log('postAddTask ERROR: ', error);
        return next(error);
      });
};

exports.getAddSharedTaskView = (req, res, next) => {
  res.render('share/addSharedTaskView', {
    pageTitle: 'Add Shared Task',
    path: '/shared/add-shared-task',
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.getEditSharedTaskView = (req, res, next) => {
  const masterTaskId = req.params.masterTaskId;
  const taskId = req.params.taskId;
  SharedTask.findById(masterTaskId).then(task => {
      if (!task) {
        console.log('getEditSharedTaskView ERROR: ', task);
        return res.redirect('/');
      }
      const [myTask] = task.tasks.filter(task => task._id == taskId);
      res.render('share/editSharedTaskView', {
        pageTitle:        'Edit Shared Task',
        path:             '/share/edit-task',
        masterTaskId,
        task:             myTask,
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

exports.postEditSharedTask = (req, res, next) => {
  const masterTaskId      = req.body.masterTaskId;
  const taskId            = req.body.taskId;
  const updatedTitle      = req.body.title;
  const updatedTotalTime  = req.body.totaltime;
  const updatedTimeStart  = req.body.timestart;
  const updatedDesc       = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('user/editTaskView', {
      pageTitle:  'Edit Shared Task',
      path:       '/share/edit-task',
      hasError:   true,
      masterTaskId,
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

  SharedTask.findById(masterTaskId).then(task => {
    const [myTask] = task.tasks.filter(task => task._id == taskId);
    if (myTask.userId.toString() !== req.user._id.toString()) {  
      return res.redirect('/');
    }
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    console.log('postEditSharedTask ERROR: ', error);
    return next(error);
  });

  SharedTask.updateOne(
    { _id: masterTaskId, "tasks._id": taskId },
    { '$set': {
      'tasks.$.title': updatedTitle,
      'tasks.$.totaltime': updatedTotalTime,
      'tasks.$.description': updatedDesc,
      'tasks.$.timestart': updatedTimeStart,
    } }
  ).then(result => {
    res.redirect('/share/task-list');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    console.log('postEditSharedTask ERROR: ', error);
    return next(error);
  });
};

exports.deleteSharedTask = (req, res, next) => {
  const masterTaskId = req.params.masterTaskId;
  const taskId = req.params.taskId;

  SharedTask.findById(masterTaskId).then(task => {
    const [myTask] = task.tasks.filter(task => task._id == taskId);
    if (myTask.userId.toString() !== req.user._id.toString()) {  
      return res.redirect('/');
    }
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    console.log('postEditSharedTask ERROR: ', error);
    return next(error);
  });

  SharedTask.updateOne(
    { _id: masterTaskId },
    { '$pull': { "tasks": { "_id": taskId}} },
    { safe: true }
  ).then(result => {
    res.redirect('/share/task-list');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    console.log('postEditSharedTask ERROR: ', error);
    return next(error);
  });
};