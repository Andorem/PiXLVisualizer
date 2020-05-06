"use strict";

import Elements from '../models/elements.model';
import {encode} from '../data/utils';

export function showElementList(req, res) {
  let names = Elements.getNames();
  if (names) res.render('elements/all-elements', {
    view: 'elements',
    header: 'Elements',
    data: names
  });
}

export function showElementMain(req, res) {
  let type = req.params.type;
  let element = Elements.get(type);
  if (element) {
    res.render('elements/element', {
      view: 'element',
      header: `${element.type.full} (${element.type.abbreviation})`,
      element: element,
      nav: {
        "Main": {link: `/element/$type}`, active: true},
        "Heatmap": {link: `/element/${type}/heatmap`},
        "Comparison": {link: `/element/${type}/compare`}
      },
      items: {
        "Heatmap": {image: `../../img/preview/${type}/preview-heatmap.png`, link: 'heatmap'},
        "Comparison": {image: `../../img/preview/${type}/preview-scatter.png`, link: 'compare'}
      }
    });
  }
  else res.status(404).send("NOT FOUND");
}

export function showElementHeatmap(req, res) {
  let type = req.params.type;
  let element = Elements.get(type);
  if (element) {
    res.render('elements/element-heatmap', {
      view: 'element-heatmap',
      header: `${element.type.full} (${element.type.abbreviation}) Heatmap`,
      data: element,
      nav: {
        "Main": {link: `/element/${type}`},
        "Heatmap": {link: '#', active: true},
        "Comparison": {link: `/element/${type}/compare`}
      }
    });
  }
  else res.status(404).send("NOT FOUND");
}

export function showElementCompare(req, res) {
  let type = req.params.type;
  let element = Elements.get(type);
  if (element) {
    res.render('elements/element-scatter-bar', {
      view: 'element-scatter-bar',
      header: `${element.type.full} (${element.type.abbreviation}) Comparison`,
      data: element,
      elementNames: Elements.getNames(),
      nav: {
        "Main": {link: `/element/${type}`},
        "Heatmap": {link: `/element/${type}/heatmap`},
        "Comparison": {link: '#', active: true}
      }
    });
  }
  else res.status(404).send("NOT FOUND");
}

export function getElement(req, res) {
  let type = req.params.type;
  let element = Elements.get(type);
  if (element) res.json(element);
  else res.status(404).send("NOT FOUND");
}

export function getAll(req, res) {
  let elements = Elements.getAll();
  if (elements) res.json(elements);
  else res.status(404).send("NOT FOUND");
}