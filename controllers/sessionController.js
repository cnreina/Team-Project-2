const APP_CWD       = process.cwd();
const User          = require(APP_CWD + '/models/userSchema');

exports.startSession = (req, res, next) => {
  res.locals.isAuthenticated  = req.session.isLoggedIn;
  res.locals.csrfToken        = req.csrfToken();
  next();
};

exports.findUserSession = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id).then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      console.log('User.findById ERROR: ', err);
      next(new Error(err));
    });
};
