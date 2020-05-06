"use strict";

import express from 'express';

var router = express.Router(); 
var elementController = require('../controllers/elements.controller');

router.get('/', function (req, res) { // Route main URL to index.html
  res.render('index', {
    view: 'index',
    header: "Home"
  });
});

router.get('/api/element/:type', elementController.getElement);
router.get('/api/element/', elementController.getAll);

export default router;