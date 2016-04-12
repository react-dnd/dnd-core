import isArray from 'lodash/isArray';

export default function matchesType(targetType, draggedItemType) {
  if (isArray(targetType)) {
    return targetType.some(t => t === true || t === draggedItemType);
  } else {
    return targetType === true || targetType === draggedItemType;
  }
}
