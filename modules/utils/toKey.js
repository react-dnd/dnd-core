import invariant from 'invariant';
import isArray from 'lodash/lang/isArray';

export default function toKey(key) {
  if (typeof key === 'string') {
    return `KEY_${key}`;
  } else if (typeof key === 'symbol') {
    return key;
  } else if (isArray(key)) {
    return key.join(String.fromCharCode(0xD83D, 0xDCA9));
  } else {
    invariant(false, '%s is neither string nor symbol');
  }
}