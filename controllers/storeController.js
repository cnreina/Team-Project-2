const APP_CWD       = process.cwd();
const Task          = require(APP_CWD + '/models/taskSchema');

const ITEMS_PER_PAGE = 20;
exports.getTasksView = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalTasks;
  Task.find().countDocuments().then(tasksCount => {
      totalTasks = tasksCount;
      return Task.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    })
    .then(tasks => {
      res.render('store/tasksView', {
        tasks: tasks,
        pageTitle: 'Tasks',
        path: '/store/task-list',
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

exports.getTaskView = (req, res, next) => {
  const taskId = req.params.taskId;
  Task.findById(taskId)
    .then(task => {
      res.render('store/taskDetailView', {
        task: task,
        pageTitle: task.title,
        path: '/store/task-list'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getTaskView ERROR: ', error);
      return next(error);
    });
};


