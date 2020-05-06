"use strict";
import express from 'express';

var elementsRouter = express.Router();
var elementController = require('../controllers/elements.controller');

elementsRouter.get('/', elementController.showElementList); // Main Elements View
elementsRouter.get('/all', elementController.showElementList);
elementsRouter.get('/:type', elementController.showElementMain); // Specific Element View
elementsRouter.get('/:type/heatmap', elementController.showElementHeatmap);
elementsRouter.get('/:type/compare', elementController.showElementCompare);

export default elementsRouter;