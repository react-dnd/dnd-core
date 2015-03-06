'use strict';

import toKey from './toKey';
import isObject from 'lodash/lang/isObject';

export default function getIn(obj, path) {
  while (path.length > 0) {
    const key = toKey(path.shift());
    if (isObject(obj[key])) {
      obj = obj[key];
    } else {
      return null;
    }
  }

  return obj;
}