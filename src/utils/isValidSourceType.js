export default function isValidSourceType(sourceType) {
  const type = typeof sourceType;
  return type === 'string' || type === 'symbol';
}

