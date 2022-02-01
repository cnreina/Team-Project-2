const express         = require('express');
const { check, body } = require('express-validator/check');
const APP_CWD         = process.cwd();

const authController  = require(APP_CWD + '/controllers/authController');
const User            = require(APP_CWD + '/models/userSchema');
const router          = express.Router();

router.get('/login',  authController.getLoginView);
router.get('/signup', authController.getSignupView);

router.post('/login',
  [
    body('email').isEmail().withMessage('Email address').normalizeEmail(),
    body('password', 'Inalid password').isLength({ min: 3 }).isAlphanumeric().trim()
  ],
  authController.postLogin
);

router.post('/signup',
  [
    check('email').isEmail().withMessage('Email address').custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'ERROR: E-Mail exists'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Password with numbers and text, at least 5 characters'
    )
    .isLength({ min: 3 }).isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('ERROR: Passwords do not match');
        }
        return true;
      })
  ],
  authController.postSignup
);

router.get('/reset',          authController.getPasswordResetView);
router.get('/reset/:token',   authController.getNewPasswordView);

router.post('/logout',        authController.postLogout);
router.post('/reset',         authController.postPasswordReset);
router.post('/new-password',  authController.postNewPassword);

module.exports = router;
