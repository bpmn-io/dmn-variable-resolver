import DmnModdle from 'dmn-moddle';

import './test.css';

export const singleStart = window.__env__ && window.__env__.SINGLE_START;

export function parse(xml) {
  return DmnModdle().fromXML(xml);
}

export function findElementById(parsed, id) {
  return parsed.elementsById[id];
}
