const objectProto = Object.prototype;
const { hasOwnProperty } = objectProto;

export const isEmptyObj = (value: object) => {
  for (const key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
};
