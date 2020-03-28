const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
import { 
  getIndex, 
  getLogin, 
  getsignup, 
  getLogout, 
  getProfile, 
  putProfile, 
  getProfileSettings, 
  postsignup, 
  postLogin,
  deleteUser,
} from '../controllers';

import {
  errorHandler
} from '../middleware';

import {
  isLoggedIn, 
  checkIfUserExists,
  isValidPassword
} from '../validation/index';


router.get('/', errorHandler(getIndex));

router.get('/login', errorHandler(getLogin));

router.post('/login', errorHandler(postLogin));

router.get('/signup', errorHandler(getsignup));

router.post('/signup', errorHandler(checkIfUserExists), upload.single('image'), errorHandler(postsignup));

router.get('/logout', errorHandler(getLogout));

router.get('/profile', isLoggedIn, errorHandler(getProfile));

router.get('/profile/settings', isLoggedIn, errorHandler(getProfileSettings));

router.put('/profile', isLoggedIn, upload.single('image'), errorHandler(isValidPassword), errorHandler(putProfile));

router.delete('/profile/delete', isLoggedIn, errorHandler(deleteUser));


module.exports = router;


