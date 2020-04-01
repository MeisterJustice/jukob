import mysql from 'mysql';
import dbconfig from '../config/database';
var connection = mysql.createConnection(dbconfig.connection);

import User from '../models/index';

export const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    req.session.redirectTo = req.originalUrl;
    res.redirect("/login");
}

export const checkIfUserExists = async (req, res, next) => {
    let emailExists = await User.findOne({ 'email': req.body.email });
    let userNameExists = await User.findOne({ 'username': req.body.username });
    if (emailExists) {
        req.flash('error', `A user with the given email, ${emailExists} is already registered`);
        return res.redirect('/register');
    }
    if (userNameExists) {
        req.flash('error', `A user with the given username, ${userNameExists} is already registered`);
        return res.redirect('/register');
    }
    next();
}

export const isValidPassword = async (req, res, next) => {
    const { user } = await User.authenticate()(req.user.username, req.body.currentPassword)
    if (user) {
        res.locals.user = user;
        next();
    } else {
        req.flash('error', 'current password is incorrect!');
        return res.redirect('back');
    }
}