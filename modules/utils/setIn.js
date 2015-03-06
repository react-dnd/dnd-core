'use strict';

import toKey from './toKey';

export default function setIn(obj, path, value) {
  while (path.length > 0) {
    const key = toKey(path.shift());
    if (path.length > 0) {
      obj = obj[key] = obj[key] || {};
    } else {
      obj = obj[key] = value;
    }
  }
}