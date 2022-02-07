// INCLUDES
const mongoose              = require('mongoose');
const { validationResult }  = require('express-validator/check');
const fileObject            = require('fs');
const PDFDocument           = require('pdfkit');

const STRYPE_API_KEY        = 'sk_test_51KKD1BAuTVk1SDPGF8v9dXfkoHYb6aSilj7zinWcTDX96Evf937kZ3yq0bOrsL1M98bIO4ObOwvpyRjXg0uDttFj00GpNAE9On';
const stripe                = require('stripe')(STRYPE_API_KEY);

const APP_CWD               = process.cwd();

const systemController      = require(APP_CWD + '/controllers/systemController');

const Task                  = require(APP_CWD + '/models/taskSchema');
const Archive                 = require(APP_CWD + '/models/archiveSchema');

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
  const imageUrl    = req.body.imageUrl;
  const price       = req.body.price;
  const description = req.body.description;
  if (!imageUrl) {
    return res.status(422).render('user/addTaskView', {
      pageTitle: 'Add Task',
      path: '/user/add-task',
      hasError: true,
      Task: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'ERROR: Image Url is required',
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
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const task = new Task({
    title:        title,
    price:        price,
    description:  description,
    imageUrl:     imageUrl,
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
  Task.findById(taskId).then(task => {
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
  const updatedPrice      = req.body.price;
  const updatedImageUrl   = req.body.imageUrl;
  const updatedDesc       = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('user/editTaskView', {
      pageTitle:  'Edit Task',
      path:       '/user/edit-task',
      hasError:   true,
      task: {
        title:        updatedTitle,
        price:        updatedPrice,
        description:  updatedDesc,
        _id:          taskId
      },
      errorMessage:     errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Task.findById(taskId).then(task => {
      if (task.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      task.title        = updatedTitle;
      task.price        = updatedPrice;
      task.description  = updatedDesc;
      task.imageUrl     = updatedImageUrl;
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
  Task.find({ userId: req.user._id }).then(tasks => {
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
  Task.findById(taskId).then(task => {
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

exports.getTimeTrackerView = (req, res, next) => {
  req.user.populate('timetracker.tasks.taskId').execPopulate().then(user => {
      const tasks = user.timetracker.tasks;
      if (!tasks) {return next();};
      res.render('user/timetrackerView', {
        path: '/user/timetracker',
        pageTitle: 'TimeTracker',
        tasks: tasks
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getTimeTrackerView ERROR: ', error);
      return next(error);
    });
};

exports.postTimeTracker = (req, res, next) => {
  const taskId = req.body.taskId;
  Task.findById(taskId).then(task => {
      return req.user.addToTimeTracker(task);
    })
    .then(result => {
      res.redirect('/user/timetracker');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postTimeTracker ERROR: ', error);
      return next(error);
    });
};

exports.postRemoveTimeTrackerTask = (req, res, next) => {
  const timetrackerTaskId = req.body.taskId;
  req.user.removeFromTimeTracker(timetrackerTaskId).then(result => {
      res.redirect('/user/timetracker');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postRemoveTimeTrackerTask ERROR: ', error);
      return next(error);
    });
};

exports.getArchiveView = (req, res, next) => {
  Archive.find({'user.userId': req.user._id}).then(archive => {
      res.render('user/archiveView', {
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

exports.postArchive = (req, res, next) => {
  req.user.populate('timetracker.tasks.taskId').execPopulate().then(user => {
      const tasks = user.timetracker.tasks.map(task => {
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
      return req.user.clearTimeTracker();
    })
    .then(() => {
      res.redirect('/user/archive');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postArchive ERROR: ', error);
      return next(error);
    });
};

exports.getCheckoutView = (req, res, next) => {
  let tasks;
  let totalPrice = 0;
  req.user.populate('timetracker.tasks.taskId').execPopulate().then(user => {
      tasks       = user.timetracker.tasks;
      totalPrice  = 0.00;
      tasks.forEach(task => {
        totalPrice += task.quantity * task.taskId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items:           tasks.map(task => {
          return {
            name:         task.taskId.title,
            description:  task.taskId.description,
            amount:       Math.round(task.taskId.price.toFixed(2)*100),
            currency:     'usd',
            quantity:     task.quantity
          };
        }),
        success_url:        req.protocol + '://' + req.get('host') + '/user/checkout/success',
        cancel_url:         req.protocol + '://' + req.get('host') + '/user/checkout/cancel'
      });
    })
    .then(session => {
      res.render('user/checkoutView', {
        path:       '/user/checkout',
        pageTitle:  'Checkout',
        tasks:      tasks,
        totalSum:   totalPrice,
        sessionId:  session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getCheckoutView ERROR: ', error);
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user.populate('timetracker.tasks.taskId').execPopulate().then(user => {
      const tasks = user.timetracker.tasks.map(task => {
        return {
          quantity:   task.quantity,
          task:       { ...task.taskId._doc }
        };
      });
      const archive = new Archive({
        user: {
          email:  req.user.email,
          userId: req.user
        },
        tasks:    tasks
      });
      return archive.save();
    })
    .then(result => {
      return req.user.clearTimeTracker();
    })
    .then(() => {
      res.redirect('/user/archive');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getCheckoutSuccess ERROR: ', error);
      return next(error);
    });
};

exports.getInvoiceView = (req, res, next) => {
  const archiveId = req.params.archiveId;
  Archive.findById(archiveId).then(archive => {
    if (!archive) {
      console.log('getInvoiceView ERROR: ', archive);
      return next(new Error('Archive not found'));
    }
    if (archive.user.userId.toString() !== req.user._id.toString()) {
      console.log('getInvoiceView ERROR: Unauthorized');
      return next(new Error('Unauthorized'));
    }
    
    res.render('user/invoiceView', {
      pageTitle:        'Invoice',
      path:             '/user/archive',
      archive:            archive,
      hasError:         false,
      errorMessage:     null,
      validationErrors: []
    });
  });
};
