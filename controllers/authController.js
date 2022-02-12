// INCLUDES
const crypto                = require('crypto');
const bcrypt                = require('bcryptjs');
const nodemailer            = require('nodemailer');
const sendgridTransport     = require('nodemailer-sendgrid-transport');
const APP_CWD               = process.cwd();
const fileSystem            = require('fs');

// ENTITIES
const User                  = require(APP_CWD + '/models/userSchema');


let sendGridTransporter;
exports.startSendGrid = () => {
    SENDGRID_KEY_STRING = process.env.SENDGRID_KEY_STRING;
    sendGridTransporter = nodemailer.createTransport(sendgridTransport({auth: {api_key: SENDGRID_KEY_STRING}}));
};

exports.isLogedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {return res.redirect('/login');};
  next();
};

exports.getSignupView = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signupView', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
};

exports.postSignup = (req, res, next) => {
  const email     = req.body.email;
  const password  = req.body.password;
  if (!email) {
    console.log(errors.array());
    return res.status(422).render('auth/signupView', {
      path:         '/signup',
      pageTitle:    'Signup',
      errorMessage: 'no email',
      oldInput: {
        email:    email,
        password: password,
        confirmPassword: req.body.confirmPassword
      }
    });
  }

  bcrypt.hash(password, 12).then(hashedPassword => {
      const user = new User({
        email:    email,
        password: hashedPassword,
        tasklist:     { tasks: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getLoginView = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/loginView', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    }
  });
};

exports.postLogin = (req, res, next) => {
  const email     = req.body.email;
  const password  = req.body.password;
  if (!email) {
    return res.status(422).render('auth/loginView', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'no email',
      oldInput: {
        email: email,
        password: password
      }
    });
  }

  User.findOne({ email: email }).then(user => {
      if (!user) {
        return res.status(422).render('auth/loginView', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid Credentials',
          oldInput: {
            email: email,
            password: password
          }
        });
      }
      bcrypt.compare(password, user.password).then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/loginView', {
            path:         '/login',
            pageTitle:    'Login',
            errorMessage: 'Invalid Credentials.',
            oldInput: {
              email:    email,
              password: password
            }
          });
        })
        .catch(err => {
          console.log('User.findOne ERROR: ', err);
          res.redirect('/login');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
};

exports.getPasswordResetView = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/passwordResetView', {
    path:           '/reset',
    pageTitle:      'Reset Password',
    errorMessage:   message
  });
};

exports.postPasswordReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log('crypto.randomBytes ERROR: ', err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then(user => {
        if (!user) {
          req.flash('error', 'No account matches the supplied email');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        sendGridTransporter.sendMail({
          to:       req.body.email,
          from:     'cnreina@gmail.com',
          subject:  'Password reset confirmation',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="https://cse341nodejsapp.herokuapp.com/reset/${token}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log('postPasswordReset ERROR: ', error);
        return next(error);
      });
  });
};

exports.getNewPasswordView = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/newPasswordView', {
        path:           '/new-password',
        pageTitle:      'New Password',
        errorMessage:   message,
        userId:         user._id.toString(),
        passwordToken:  token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword     = req.body.password;
  const userId          = req.body.userId;
  const passwordToken   = req.body.passwordToken;
  let   resetUser;

  User.findOne({
    resetToken:           passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id:                  userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
