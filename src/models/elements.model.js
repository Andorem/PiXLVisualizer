"use strict";
import {DATA, DATA_BASE64} from "../data/data.js";
import {ELEMENT_NAMES} from '../data/names.js';

var Elements = {

  get(type) {
    let elementData = DATA[type];
    return elementData;
  },

  getAll(encode=false) {
    return (encode ? DATA_BASE64 : DATA);
  },

  getNames() {
    return ELEMENT_NAMES;
  },

  getPixel(type, detector, x, y) {
    let detectorData = DATA[detector];
    let pixelAt = {};
    for (pixel of detectorData) {
      if (pixel.x == x && pixel.y == y) {
      pixelAt = pixel;
      break;
      }
    }
    return pixelAt;
  }
}
export default Elements;