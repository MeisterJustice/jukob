var express = require('express');
var router = express.Router();
var { storage } = require('../config/cloudinary');
import multer from 'multer';
const upload = multer({ storage });

import { 
  getRent, 
  postRent, 
  getRentShowPage, 
  getNew,
  deleteItem
} from '../controllers/rent';

import {
  errorHandler
} from '../middleware';

import {
  isLoggedIn, 
} from '../validation/index';




router.get('/', errorHandler(getRent));

router.get('/new', isLoggedIn, errorHandler(getNew));

router.post('/', isLoggedIn, upload.array('images', 5), errorHandler(postRent));

router.get('/:id', errorHandler(getRentShowPage));

router.delete('/:id', errorHandler(deleteItem));

module.exports = router;
