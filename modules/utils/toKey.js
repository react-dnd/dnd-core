'use strict';

import invariant from 'invariant';

export default function toKey(key) {
  if (typeof key === 'string') {
    return `KEY_${key}`;
  } else if (typeof key === 'symbol') {
    return key;
  } else {
    invariant(false, '%s is neither string nor symbol');
  }
}