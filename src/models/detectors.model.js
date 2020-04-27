"use strict";
import {DATA} from "../data/data.js";
import {DETECTOR_NAMES} from '../data/names';

const allDetectors = {};
DETECTOR_NAMES.forEach((detector) => {
    allDetectors[detector] = _getElements(detector);
});

function _getElements(detector) {
    let detectorData = [];
    
    // Flatten detector data for each element into single array
    Object.values(DATA).forEach((element) => {
        let perElem = element[detector];
        for (let i = 0; i < perElem.length; i++) {
            // init index as object
            if (!detectorData[i]) {
                detectorData[i] = {};
                detectorData[i].count = perElem[i].count;
            }
            detectorData[i][element.type.abbreviation] = {
                coords: perElem[i].coords,
                relative: perElem[i].relative,
                absolute: perElem[i].absolute
            }
        }
    });
    return detectorData;
}

var Detectors = {
  get(detector) {
    let detectorData = allDetectors[detector];
    if (detectorData) return detectorData;
    else return "NOT FOUND";
  },

  getFor(detector, type) {
    let detectorData = DATA[type][detector];
    if (detectorData) return detectorData;
    else return "NOT FOUND";
  }
}

export default Detectors;