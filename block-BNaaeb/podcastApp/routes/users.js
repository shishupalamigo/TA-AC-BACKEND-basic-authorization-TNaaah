var express = require('express');
var User = require('../models/User');
var auth = require('../middlewares/auth');

var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//register user

router.get('/register', function(req, res, next) {
  var error = req.flash('error')[0];
  res.render('userRegistrationForm', { error });
});

router.post('/register', (req, res, next) => {

  User.create(req.body, (err, user) => {
    if(err) {
      if(err.name === 'MongoError') {
        req.flash('error', 'This email is already in use');
        return res.redirect('/users/register');
      }
      if(err.name === 'ValidationError') {
        req.flash('error', err.message);
        return res.redirect('/users/register');
      }
    }
    res.redirect('/users/login');
  });
});

//user login

router.get('/login', (req, res, next) => {
  var error = req.flash('error')[0];
  res.render('userLoginForm', { error });
});

router.post('/login', (req, res, next) => {
  let { email, password } = req.body;
  //if fields are empty
  if (!email || !password) {
    req.flash('error', 'Email/Password required!');
    return res.redirect('/users/login');
  }
  User.findOne({ email: email }, (err, user) => {
    if (err) return next(err);
    //if no email match
    if (!user) {
      req.flash('error', 'This email is not registered');
      return res.redirect('/users/login');
    }
    user.checkPassword(password, function (err, result) {
      if (err) return next(err);
      //password didnt match
      if (!result) {
        req.flash('error', 'Incorrect password! Try Again!');
        return res.redirect('/users/login');
      }
      //password match
      req.session.userId = user.id;
      req.session.userType = user.userType;
      res.redirect('/home');
    });
  });
});

router.get('/logout', auth.isLoggedIn, (req, res, next) => {
  if(!req.session) {
    req.flash('error', 'You must login first');
    res.redirect('/users/login');  
  }
  else {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/users/login');
  }
});

module.exports = router;