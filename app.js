'use strict';

let express = require('express');
let path = require('path'); // to take care of file paths
let passport = require('passport');
// let session = require('express-session');
let mongoose = require('mongoose');

const keys = require('./config/keys_prod');
// Load Middleware
const corsHandler = require('./middleware/corsHandler');
const errorHandler = require('./middleware/errorHandler');
const expressValidator = require('./middleware/expressValidator');


// nogger config
let logParams = {
  consoleOutput : true,
  consoleOutputLevel: ['DEBUG','ERROR','WARNING'],

  dateTimeFormat: "DD-MM-YYYY HH:mm:ss.S",
  outputPath: "public/logs/",
  fileNameDateFormat: "DDMMYYYY",
  fileNamePrefix:"log-drbookin-"
};
let log = require('noogger').init(logParams);

// Init App
let app = express();

// Init MIDDELWARE
app.use(corsHandler);
app.use(errorHandler);
app.use(expressValidator);
// app.use(passport.initialize()); // Load Passport Config and Init Passport Middleware
// app.use(passport.session());

// Set Static Folder
app.use(express.static(path.join(__dirname, '/public')));
console.log('dist path: ',__dirname);

// BodyParser MIDDELWARE
app.use(express.json());
app.use(express.urlencoded({  extended: false  }));

// Handle session
/* app.use(
  session({
    secret: 'drbookin costarica',
    saveUninitialized: true,
    resave: true
  })
); */

// Routes
// app.use('/', (req, res) => {});
app.use('/api/doctors', require('./routes/doctors'));

// Database Connection
mongoose.connect(keys.dbUri, {
  useNewUrlParser: true,
  auth: {
    user: 'francomac-dev',
    password: 'francoMC1986#'
  }
})
console.log('Connected to database', keys.dbUri)

let conn = mongoose.connection;

process.on('error', (err) => {
  console.error.bind('connection error:' +  err);
  logger(err, 'error');
});
process.once('open', () =>{
 console.log('Connected to adatabase', keys.dbUri)
});
process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
  process.disconnect();

});
conn
  .then(() => {
    logger(keys, 'info');
  })
  .catch((err) => {
    logger(err, 'emergency');
  })

// manages log files
function logger(error, type) {
  switch (type) {
    case 'emergency':
      log.emergency(error);
      process.exit(0);
      break;
    case 'alert':
      log.alert(error);
      process.exit(0);
      break;
    case 'critical':
      log.critical(error);
      process.exit(0);
      break;
    case 'error':
      log.error(error);
      break;
    case 'warning':
      log.warning(error);
      break;
    case 'notice':
      log.notice(error);
      break;
    case 'info':
      log.info(error);
      break;
    case 'debug':
      log.debug(error);
      break;
    default:
      break;
  }
}

// module.exports = app;
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

