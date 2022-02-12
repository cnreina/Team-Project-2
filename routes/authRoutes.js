const express         = require('express');
const APP_CWD         = process.cwd();

const authController  = require(APP_CWD + '/controllers/authController');
const User            = require(APP_CWD + '/models/userSchema');
const router          = express.Router();

router.get('/login',          authController.getLoginView);
router.get('/signup',         authController.getSignupView);

router.post('/login',         authController.postLogin);

router.post('/signup',        authController.postSignup);

router.get('/reset',          authController.getPasswordResetView);
router.get('/reset/:token',   authController.getNewPasswordView);

router.post('/logout',        authController.postLogout);
router.post('/reset',         authController.postPasswordReset);
router.post('/new-password',  authController.postNewPassword);

module.exports = router;
