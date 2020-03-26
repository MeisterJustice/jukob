import User from '../models/index';
import LocalStrategy from 'passport-local';

module.exports = (passport) => {
    passport.use(User.createStrategy());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
}