var express = require('express');
var router = express.Router();
var { storage } = require('../config/cloudinary');
import multer from 'multer';
const upload = multer({ storage });

import { 
  getLodge, 
  postLodge, 
  getLodgeShowPage, 
  getNewLodge,
  deleteItem,
  putLodge,
  getPutLodge
} from '../controllers/lodge';

import {
  errorHandler
} from '../middleware';

import {
  isLoggedIn, 
  checkIfUserExists,
  isValidPassword,
} from '../validation/index';




router.get('/', errorHandler(getLodge));

router.get('/new', isLoggedIn, errorHandler(getNewLodge));

router.post('/', isLoggedIn, upload.array('images', 5), errorHandler(postLodge));

router.get('/:id', errorHandler(getLodgeShowPage));

router.get('/:id/update', isLoggedIn, errorHandler(getPutLodge));

router.put('/:id', isLoggedIn, errorHandler(putLodge));

router.delete('/:id', errorHandler(deleteItem));

module.exports = router;
