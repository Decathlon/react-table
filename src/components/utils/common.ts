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

export const getStringNumberWithoutTrailingZeros = (value: number, decimals: number): string =>
  Number(value.toFixed(decimals)).toString();
