var express = require('express');
var router = express.Router();
var { storage } = require('../config/cloudinary');
import multer from 'multer';
const upload = multer({ storage });

import { 
  getSell, 
  postSell, 
  getSellShowPage, 
  getNew,
  deleteItem,
  getPutSell,
  putSell
} from '../controllers/sell';

import {
  errorHandler
} from '../middleware';

import {
  isLoggedIn, 
  checkIfUserExists,
  isValidPassword
} from '../validation/index';




router.get('/', errorHandler(getSell));

router.get('/new', isLoggedIn, errorHandler(getNew));

router.post('/', isLoggedIn, upload.array('images', 5), errorHandler(postSell));

router.get('/:id', errorHandler(getSellShowPage));

router.get('/:id/update', isLoggedIn, errorHandler(getPutSell));

router.put('/:id', isLoggedIn, errorHandler(putSell));

router.delete('/:id', errorHandler(deleteItem));

module.exports = router;
