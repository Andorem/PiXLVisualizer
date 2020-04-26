"use strict";
import express from 'express';

var elementsRouter = express.Router();
var elementController = require('../controllers/elements.controller');

elementsRouter.get('/', elementController.getAll); // Main Elements View
elementsRouter.get('/:type', elementController.getElement); // Specific Element View

export default elementsRouter;