'use strict';

import toKey from './toKey';

export default function getIn(obj, path) {
  while (path.length > 0) {
    const key = toKey(path.shift());
    if (typeof obj[key]) {
      obj = obj[key];
    } else {
      return null;
    }
  }

  return obj;
}