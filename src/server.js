"use strict";

import path from 'path';
import {DATA} from './data/data.js'; 
import {encode} from './data/utils.js'; 
import router from './routes/index.router';
import elementsRouter from './routes/elements.router';
import detectorsRouter from './routes/detectors.router';

var express = require('express');
var hbs = require('express-handlebars');

// Connect to port
var app = express();
app.set('port', 3000);
app.listen(app.get('port'));
console.log("Server listening on " + app.get('port'));

// Set up JSON responses
app.use(express.json());
app.set('json spaces', 2);
app.use(express.urlencoded({
  extended: true
})); 

// HTML and CSS
let rootDir = path.resolve(__dirname, '../');
app.use('/js',express.static(path.join(rootDir, 'public/js')));
app.use('/css',express.static(path.join(rootDir, 'public/css')));
app.set('views', path.join(__dirname, 'views'));

// Template Engine
app.engine('hbs', hbs({
  extname: '.hbs',
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views/partials'),
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    ifeq: ifEqual,
    ifnoteq: ifNotEqual,
    stringify: stringify,
    base64: base64
  }
}));
app.set('view engine', 'hbs');// for html templates

// Template Engine Helpers
function ifEqual(a, b, options) {
  if (a == b) { return options.fn(this); }
  return options.inverse(this);
};
function ifNotEqual(a, b, options) {
  if (a != b) { return options.fn(this); }
  return options.inverse(this);
};
function stringify(a) {
  return JSON.stringify(a);
};
function base64(a) {
  return encode(a);
}

// Routes for Controllers
app.use('/', router);
app.use('/element(s?)', elementsRouter);
app.use('/detector(s?)', detectorsRouter);

