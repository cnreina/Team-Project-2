/* CSE 341 - Team 2
    Carlos N Reina
    Michael Norton
    Aaron Rooks
    Leonardo Souza
*/

require('dotenv').config();
const express                         = require('express');
const session                         = require('express-session');
const SESSION_SECRET                  = process.env.SESSION_SECRET;
const bodyParser                      = require('body-parser');

// MongoDB
const mongoose                        = require('mongoose');
const MongoDBStore                    = require('connect-mongodb-session')(session);
const MONGODB_OPTIONS                 = {useUnifiedTopology: true, useNewUrlParser: true, family: 4};
const MONGODB_TEAM_CONNECTION_STRING  = process.env.MONGODB_TEAM_CONNECTION_STRING;
const sessionStore                    = new MongoDBStore({uri: MONGODB_TEAM_CONNECTION_STRING, collection: 'sessions'});

const APP_CWD                         = process.cwd();
const PORT                            = process.env.PORT || 3000;
const HEROKU_TEAM_APP_URL             = process.env.HEROKU_TEAM_APP_URL;

const CORS_OPTIONS              = { origin: HEROKU_TEAM_APP_URL, optionsSuccessStatus: 200 };
const cors                      = require('cors');

const csrf                      = require('csurf');
const csrfProtection            = csrf();
const flash                     = require('connect-flash');
const multer                    = require('multer');

// CONTROLLERS
const sessionController         = require(APP_CWD + '/controllers/sessionController');
const authController            = require(APP_CWD + '/controllers/authController');
const errorController           = require(APP_CWD + '/controllers/errorController');

const fileStorage               = multer.diskStorage({destination: (req, file, callBack) => {
  callBack(null, 'images');
  },
  filename: (req, file, callBack) => {
    callBack(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter  = (req, file, callBack) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    callBack(null, true);
  } else {
    callBack(null, false);
  }
};

// ROUTES
const homeRoutes    = require(APP_CWD + '/routes/homeRoutes');
const userRoutes    = require(APP_CWD + '/routes/userRoutes');
const shareRoutes   = require(APP_CWD + '/routes/shareRoutes');
const authRoutes    = require(APP_CWD + '/routes/authRoutes');


// ********** EXPRESS APP
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(cors(CORS_OPTIONS));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(APP_CWD + '/public'));
app.use('/images', express.static(APP_CWD + '/images'));

const SESSION_OPTIONS = {secret: SESSION_SECRET, resave: false, saveUninitialized: false, store: sessionStore};
app.use(session(SESSION_OPTIONS));

app.use(csrfProtection);
app.use(flash());

app.use(sessionController.startSession);
app.use(sessionController.findUserSession);

app.use(homeRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(shareRoutes);

app.use('/', errorController.get404View);

app.use((error, req, res, next) => {
  res.status(500).render('error/500View', {
    pageTitle:        'Error',
    path:             '/500',
    isAuthenticated:  req.session.isLoggedIn,
    error:            error
  });
});


// ********** START SERVER
console.log('  ');
console.log('**********************************');
console.log('  ');
console.log('Starting Server . . .');
console.log('Connecting MongoDB . . .');
mongoose.connect(MONGODB_TEAM_CONNECTION_STRING, MONGODB_OPTIONS).then(result => {
  console.log('MongoDB Is Connected');
  console.log('Connecting SendGrid . . .');
  authController.startSendGrid();
  console.log('SendGrid Is Connected');
  app.listen(PORT);
  console.log('  ');
  console.log('Server Is Running (Port: ' + PORT + ')');
  console.log('  ');
console.log('**********************************');
})
.catch(err => {
  console.log('mongoose.connect ERROR: ', err);
});
