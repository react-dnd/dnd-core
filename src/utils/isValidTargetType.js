import isArray from 'lodash/isArray';

export default function isValidTargetType(targetType) {
  if (isArray(targetType)) {
    for (let n = 0, len = targetType.length; n < len; n++) {
      const type = typeof targetType[n];
      if (type !== 'boolean' && type !== 'string' && type !== 'symbol') {
        return false;
      }
    }

    return true;
  } else {
    const type = typeof targetType;
    return type === 'boolean' || type === 'string' || type === 'symbol';
  }
}

