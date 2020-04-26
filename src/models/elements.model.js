"use strict";
import {DATA, DATA_BASE64} from "../data/data.js";

var Elements = {

  get(type) {
    let elementData = DATA[type];
    if (elementData) return elementData;
    else return "NOT FOUND";
  },

  getAll(encode=false) {
    return (encode ? DATA_BASE64 : DATA);
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