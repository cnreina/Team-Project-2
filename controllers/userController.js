// INCLUDES
const mongoose              = require('mongoose');
const { validationResult }  = require('express-validator/check');
const fileObject            = require('fs');
const PDFDocument           = require('pdfkit');

const APP_CWD               = process.cwd();

const Task    = require(APP_CWD + '/models/taskSchema');
const Archive = require(APP_CWD + '/models/archiveSchema');

exports.postPunchIn = (req, res, next) => {
  const taskId = req.body.taskId;
  const inTime = Date.now();
  Task.findById(taskId).then(task => {
    if (task.timeStart) {
      return res.redirect('back');
    }
    task.timeStart = inTime;
    task.save().then(result => {
      // console.log('postPunchIn: ',result);
      // res.redirect('/user/task-list');
      return res.redirect('back');
    })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log('postPunchIn-timeStart ERROR: ', error);
        return next(error);
      })
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postPunchIn ERROR: ', error);
      return next(error);
    })
};

exports.postPunchOut = (req, res, next) => {
  // console.log('punching Out');
  const taskId = req.body.taskId;
  const outTime = Date.now();
  Task.findById(taskId).then(task => {
    if (!task.timeStart) {
      return res.redirect('back');
    }
    const inTime = task.timeStart;
    const totalTime = outTime - inTime;
    task.totaltime += totalTime;
    task.timeStart = null;
    const hours = Math.floor(task.totaltime / 1000 / 60 / 60);
    const remH = task.totaltime - (60 * 60 * 1000 * hours)
    const minutes = Math.floor(remH / 1000 / 60);
    // console.log("h: " + hours + " m: " + minutes);
    task.hours = hours;
    task.minutes = minutes;
    task.save().then(result => {
      // console.log('postPunchOut: ', result);
      return res.redirect('back');
    })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log('postPunchOut ERROR: ', error);
        return next(error);
      })
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('postPunchOut ERROR: ', error);
      return next(error);
    })
}

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
  const description = req.body.description;
  const sharedtask  = req.body.shared;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('user/addTaskView', {
      pageTitle:  'Add Task',
      path:       '/user/add-task',
      hasError:   true,
      Task: {
        title:        title,
        description:  description
      },
      errorMessage:     errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const task = new Task({
    title:        title,
    totaltime:    0,
    description:  description,
    userId:       req.user,
    archived:     false,
    shared:       Boolean(sharedtask)
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
      pageTitle:          'Edit Task',
      path:               '/user/edit-task',
      task:               task,
      hasError:           false,
      errorMessage:       null,
      validationErrors:   []
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
  const taskId        = req.body.taskId;
  const updatedTitle  = req.body.title;
  const updatedDesc   = req.body.description;
  const sharedtask    = req.body.shared;

  const errors = validationResult(req);
  if (!taskId) {
    const error = new Error('postEditTask ERROR: No taskId');
    error.httpStatusCode = 500;
    console.log(error);
    return next(error);
  }

  Task.findById(taskId).then(task => {
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/');
    }

    task.title        = updatedTitle;
    task.description  = updatedDesc;
    task.shared       = Boolean(sharedtask);
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
  Task.find({ 'userId': req.user._id, archived: false }).then(tasks => {
    res.render('user/tasksView', {
      tasks:      tasks,
      pageTitle:  'User Tasks',
      path:       '/user/task-list'
    });
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getTasksView ERROR: ', error);
      return next(error);
    });
};

exports.postArchiveTask = (req, res, next) => {
  const taskId = req.body.taskId;
  Task.findById(taskId).then(task => {
    if (!task || task.archived) {
      const error = new Error('ERROR: Task already archived');
      error.httpStatusCode = 500;
      console.log(error);
      throw error;
    }
    // Update and save task
    task.shared   = false;
    task.archived = true;
    task.save().then(result => {
        Archive.findOne({ 'user.userId': req.user._id, }).then(archive => {
          if (!archive) {
            const newArchive = new Archive({
              user: {
                email:  req.user.email,
                userId: req.user._id
              },
              tasks: [task._id]
            });
            newArchive.save().then(result => {
              return res.redirect('/user/archive');
            })
              .catch(err => {
                console.log(err);
              })
          }
          // Push a reference to the task into an existing archive
          archive.tasks.push(task._id);
          archive.save().then(result => {
            return res.redirect('/user/task-list');
          })
            .catch(err => {
              const error = new Error(err);
              error.httpStatusCode = 500;
              console.log('Archive Task ERROR: ', error);
              return next(error);
            })
        })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            console.log('Archive Task ERROR: ', error);
            return next(error);
          })
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log('Archive Task ERROR: ', error);
        return next(error);
      })
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('Archive Task ERROR: ', error);
      return next(error);
    })
};

exports.deleteArchiveTask = (req, res, next) => {
  const taskId    = req.body.taskId;
  const archiveId = req.body.archiveId;
  Archive.findOne({ _id: archiveId }).then(archive => {
    if (!archive) {
      const error = new Error('ERROR: No such archive');
      error.httpStatusCode = 500;
      console.log(error);
      throw error;
    }
    // update task list
    const taskList    = archive.tasks;
    const newTaskList = taskList.filter((value, index, taskList) => {
      return value.toString() !== taskId.toString();
    });
    archive.tasks = newTaskList;
    archive.save().then(result => {
        Task.deleteOne({ _id: taskId }).then(result => {
          res.redirect('/user/archive');
        })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            console.log('Delete archive Task ERROR: ', error);
            return next(error);
          })
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log('Delete archive Task ERROR: ', error);
        return next(error);
      })
  })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('Delete archive Task ERROR: ', error);
      return next(error);
    })
};

exports.postMakeActive = (req, res, next) => {
  const taskId    = req.body.taskId;
  const archiveId = req.body.archiveId;
  Archive.findOne({ _id: archiveId }).then(archive => {
      if (!archive) {
        const error = new Error('ERROR: No such archive');
        error.httpStatusCode = 500;
        console.log(error);
        throw error;
      }
      // update task list
      const taskList    = archive.tasks;
      const newTaskList = taskList.filter((value, index, taskList) => {
        return value.toString() !== taskId.toString();
      });
      archive.tasks = newTaskList;
      archive.save().then(result => {
          // make task not archived
          Task.findOne({ _id: taskId }).then(task => {
              task.archived = false;
              task.save().then(result => {
                  res.redirect('/user/task-list');
                })
                .catch(err => {
                  const error = new Error(err);
                  error.httpStatusCode = 500;
                  console.log('Make task active ERROR: ', error);
                  return next(error);
                })
            })
            .catch(err => {
              const error = new Error(err);
              error.httpStatusCode = 500;
              console.log('Make task active ERROR: ', error);
              return next(error);
            })
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          console.log('Make task active ERROR: ', error);
          return next(error);
        })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('Make task active ERROR: ', error);
      return next(error);
    })
}

exports.getArchiveView = (req, res, next) => {
  Archive.findOne({ 'user.userId': req.user._id})
    .then(archive => {
      if(!archive){
        return res.render('user/archivedTasksView', {
          path: '/user/archive',
          pageTitle: 'Archive',
          archive: archive,
        });
      };
      archive.populate('tasks')
        .execPopulate()
        .then(archive => {
          res.render('user/archivedTasksView', {
            path: '/user/archive',
            pageTitle: 'Archive',
            archive: archive,
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          console.log('getArchiveView ERROR: ', error);
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getArchiveView ERROR: ', error);
      return next(error);
    });
};
