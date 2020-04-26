"use strict";

import Detectors from '../models/detectors.model';

export function getDetector(req, res) {
  let name = req.params.name;
  let detector = Detectos.get(name);
  if (detector) res.json(detector);
  else res.status(404).send("NOT FOUND");
}

export function getDetectorElement(req, res) {
  let name = req.params.name;
  let type = req.params.type;
  let detectorElement = Detectors.getFor(detector, type);
  if (detectorElement) res.json(detectorElement);
  else res.status(404).send("NOT FOUND");
}