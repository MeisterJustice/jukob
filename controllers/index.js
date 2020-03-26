import mysql from 'mysql';
import dbconfig from '../config/database';
import util from 'util';
import User from '../models';
const cloudinary = require('../config/cloudinary');
var connection = mysql.createConnection(dbconfig.connection);


export const getIndex = async (req, res, next) => {
  res.render('index', { title: 'Express' });
}


export const getsignup = async (req, res, next) => {
  res.render('auth/signup', { message: req.flash('signupMessage') });
}

export const postsignup = async (req, res, next) => {
  try {
    if (req.file) {
      const { secure_url, public_id } = req.file;
      req.body.image = {
        secure_url,
        public_id
      }
    }
    let newUser = await new User({
      email: req.body.email,
      username: req.body.username
    });
    const user = await User.register(newUser, req.body.password);
    const data = await { username: user.username, email: user.email, password: user.salt, secure_image_url: user.image.secure_url };
    const insertUser = `INSERT INTO users SET ?`;
    connection.query(insertUser, data, (err, result) => {
      if (err) {
        console.log(err);
        req.flash('error', `could not authenticate you`);
        res.redirect('/signup');
      };
      req.login(user, function (err) {
        if (err) {
          req.flash('error', `${err}`);
          return res.redirect('/login');
        }
        req.flash('success', `We're pleased to have you, ${user.username}!`);
        res.redirect('/');
      });
    })
  } catch (err) {
    deleteProfileImage(req);
    const { username, email } = req.body;
    let error = err.message;
    if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
      error = 'A user with the given email is already registered';
    }
    res.render('auth/signup', { title: 'Register', username, email, error });
  }
}

export const getLogin = async (req, res, next) => {
  res.render('auth/login', { message: req.flash('loginMessage') });
}

export const postLogin = async (req, res, next) => {
  const {
    username,
    password
  } = req.body;
  const {
    user,
    error
  } = await User.authenticate()(username, password);
  if (!user && error) {
    req.flash('error', "Wrong username or password!");
    return res.redirect('/login');
  }
  req.login(user, function (err) {
    if (err) return res.redirect('/login');
    req.flash('success', `Welcome back ${username}`);
    const redirectUrl = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
  });
}

export const getLogout = async (req, res, next) => {
  req.logout();
  res.redirect('/');
}

export const getProfile = async (req, res, next) => {
  connection.query(`SELECT * FROM users WHERE username = '${req.user.username}'`, (err, result) => {
    if (err) throw err;
    res.render('profile/profile', { user: result[0] });
  })
}

export const getProfileSettings = async (req, res, next) => {
  let findUserInfo = `SELECT * FROM users WHERE username = '${req.user.username}'`;
  connection.query(findUserInfo, (err, result) => {
    if (err) throw err;
    res.render('profile/settings', { user: result[0] });
  })

}

export const putProfile = async (req, res, next) => {
  const {
    username,
    email,
    first_name,
    last_name,
    phone_number,
  } = req.body;
  if (req.file) {
    let findUser = `SELECT * FROM users WHERE username = '${req.user.username}'`;
    connection.query(findUser, (err, result) => {
      if (err) throw err;
      if (result[0].public_image_id) cloudinary.v2.uploader.destroy(result[0].public_image_id);
      const { secure_url, public_id } = req.file;
      let data = { username: username, email: email, first_name: first_name, last_name: last_name, phone_number: phone_number, secure_image_url: secure_url, public_image_id: public_id };
      let updateUser = `UPDATE users SET ? WHERE username = '${req.user.username}'`;
      connection.query(updateUser, data, (err, result1) => {
        if (err) throw err;
        const login = util.promisify(req.login.bind(req));
        login(result1[0]);
        res.redirect('back', { user: result1[0] });
      });
    });

    let data = { username: username, email: email, first_name: first_name, last_name: last_name, phone_number: phone_number };
    let updateUser = `UPDATE users SET ? WHERE username = '${req.user.username}'`;
    connection.query(updateUser, data, (err, result2) => {
      if (err) throw err;
      // const login = util.promisify(req.login.bind(req));
      // login(result2[0]);
      res.redirect('back', { user: result2[0] });
    });
  }
}