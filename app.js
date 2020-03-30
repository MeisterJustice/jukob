import createError from 'http-errors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import logger from 'morgan';
import methodOverride from 'method-override';
import mongoose from 'mongoose';


var app = express();

// CONNECT TO MONGODB
mongoose.set("debug", true);
mongoose.connect('mongodb://localhost:27017/rilter', {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.log("ERROR: ", err.message);
});

// require routes
var indexRouter = require('./routes');
var sellRouter = require('./routes/sell');
var rentRouter = require('./routes/rent');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// configure session
app.use(session ({
  secret: 'jfjhjjfjjk',
  resave: true,
  saveUninitialized: true
}));

// configure passport
app.use(passport.initialize());
app.use(passport.session());

// flash config
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.currentUser = req.user;
  next();
});

// pass passport 
require('./config/passport')(passport);

// configure routes
app.use('/', indexRouter);
app.use('/sell', sellRouter);
app.use('/rent', rentRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
