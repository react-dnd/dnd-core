'use strict';

import toKey from './toKey';

export default function setIn(obj, path, value) {
  while (path.length > 0) {
    const key = toKey(path.shift());
    if (obj[key]) {
      obj = obj[key];
    } else {
      obj = obj[key] = path.length ? {} : value;
    }
  }
}