var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var mongoStore = require('connect-mongo');
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var homeRouter = require('./routes/home');
var adminRouter = require('./routes/admin');
var clientRouter = require('./routes/client');
var podcastRouter = require('./routes/podcast');
var auth = require('./middlewares/auth');

//database connection

mongoose.connect(
  'mongodb://localhost:27017/podcastApp',
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log(err ? err : 'databse connected');
  }
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session handler
app.use(
  session({
    secret: 'some text',
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({
      mongoUrl: 'mongodb://localhost/podcastApp'
    }),
  })
);

//flash setup
app.use(flash());

//adding user to req
app.use(auth.userInfo);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/home', homeRouter);
app.use('/admin', adminRouter);
app.use('/client', clientRouter);
app.use('/podcast', podcastRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;