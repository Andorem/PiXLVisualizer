"use strict";

import Elements from '../models/elements.model';
import {encode} from '../data/utils';

export function getAll(req, res) {
  let elements = Elements.getAll();
  if (elements) res.json(elements); // We really, really shouldn't be doing this (takes forever to load, about 435k lines)
  else res.status(404).send("NOT FOUND");
}

export function listElements(req, res) {
  let names = Elements.getNames();
  if (names) res.render('elements/all-elements', {
    view: 'elements',
    header: 'Elements',
    data: names
  });
}

export function getElement(req, res) {
  let type = req.params.type;
  let element = Elements.get(type);
  if (element) {
    res.render('elements/element', {
      view: 'element',
      header: `${element.type.full} (${element.type.abbreviation})`,
      data: element,
      nav: {
        "Heatmap": {link: '#heatmap', active: true}
      }
    });
  }
  else res.status(404).send("NOT FOUND");
}