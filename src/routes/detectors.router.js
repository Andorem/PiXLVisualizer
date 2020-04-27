"use strict";
import express from 'express';

var detectorsRouter = express.Router();
var detectorsController = require('../controllers/detectors.controller');

detectorsRouter.get('/:name', detectorsController.getDetector);
detectorsRouter.get('/:name/:type', detectorsController.getDetectorElement);

export default detectorsRouter;