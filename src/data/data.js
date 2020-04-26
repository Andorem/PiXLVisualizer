"use strict";

import fs from 'fs';
import path from 'path';
import parse from 'csv-parse/lib/sync';
import {ELEMENT_NAMES, DETECTOR_NAMES} from './names';
import {encode} from '../data/utils';

var csvPath = path.join(__dirname, 'data.csv'); // Add a comma to the column name 'img_j", otherwise it'll fail to parse
var jsonPath = path.join(__dirname, 'data.json');
var rawData, DATA, DATA_BASE64, DATA_JSON;
var ELEMENT_TYPES;

try {
    console.log("Importing from ./data.json...");
    let json = require("./data.json");
    DATA = json['data'];
    DATA_JSON = JSON.stringify(DATA);
    DATA_BASE64 = json['base64'];
}
catch(err) {
    console.log("No data.json found. Parsing CSV data...");
    rawData = parseRawData(csvPath);
    ELEMENT_TYPES = parseElementTypes(rawData);

    let json = {};
    json['data'] = parseData(rawData);
    DATA = json['data'];

    json['base64'] = encode(DATA);
    DATA_BASE64 = json['base64'];

    DATA_JSON = JSON.stringify(DATA);
    fs.writeFileSync(jsonPath, JSON.stringify(json));
}

module.exports = {
    DATA,
    DATA_JSON,
    DATA_BASE64
}



// Get CSV data as array of array of values
// [PMC,Detector,Mg_%,Al_%,Ca_%,Ti_%,Fe_%,Si_%,Mg_int,Al_int,Ca_int,Ti_int,Fe_int,Si_int,image_i,image_j] // single row
function parseRawData() {
    var fileData = fs.readFileSync(csvPath, 'utf8');
    var rows = parse(fileData, {columns: false, trim: true});
    if (!rows) return false;
    rows.forEach((row) => {
        if (row[row.length - 1] == "") row.pop(); // remove empty last value
    });
    return rows;
}

// Get element types (with column indices of their relative and absolute values)
function parseElementTypes(rawData) {
    const headers = rawData[0];
    const RELATIVE_LABEL = "_%";
    const ABSOLUTE_LABEL = "_int";
    const TYPES = {};
    Object.keys(ELEMENT_NAMES).forEach((name) => {
        let type = {};
        type.abbreviation = name;
        type.full = ELEMENT_NAMES[name];
        type.colRelative = headers.indexOf(name + RELATIVE_LABEL);
        type.colAbsolute = headers.indexOf(name + ABSOLUTE_LABEL);
        TYPES[name] = type;
    });
    rawData.shift();
    return TYPES;
}

// Get data for each detector (A or B) of a particular element
function parseDetectorData(detector, type, rawData) {
    let detectorData = [];
    let rowsForDetector = rawData.filter((row) => {return row[1] == detector;})
    rowsForDetector.forEach((row) => {
        let rowData = {
            count: row[0],
            relative: row[type.colRelative],
            absolute: row[type.colAbsolute],
            coords: {
                x: row[14],
                y: row[15]
            }
        }
        detectorData.push(rowData);
    });
    return detectorData;
}

// Convert array of raw rows to organized data (separated by element type, see below)
function parseData(rawData) {
    let masterData = {};

    // Get data for each pixel per element
    Object.values(ELEMENT_TYPES).forEach((type) => {
        let thisElement = {};
        thisElement.type = type;

        DETECTOR_NAMES.forEach((detector) => {
            thisElement[detector] = parseDetectorData(detector, type, rawData);
        });

        masterData[type.abbreviation] = thisElement;
    });
    return masterData;
}



/* DATA = {
    "element_type" : { // e.g. Mg
        type: {
            abbreviation: str // e.g. Mg
            full: str // e.g. Magnesium
            colRelative: num, %
            colAbsolute = num, _int
        }
        "A" or "B": [   // an object for each pixel (i.e. row for that element)
            {
                count: // original PMC value
                relative: num
                absolute: num
                coords: {
                    x: num
                    y: num
                }
            }
            ...
        ]
        ...
    }
    ...
}
*/

