"use strict";

import express from 'express';

var router = express.Router(); 

router.get('/', function (req, res) { // Route main URL to index.html
  res.render('index', {
    view: 'index',
    header: "Home",
    nav: {
      "About": {link: "#about", active: true},
      "Tools": {link: "#tools"}
    }
  });
});

export default router;