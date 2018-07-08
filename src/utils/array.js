/* eslint-disable */


Array.prototype.unique = function () {
  return [...new Set (this)];
};

export const unique = (arr) => [...new Set(arr)]

/* eslint-enable */
