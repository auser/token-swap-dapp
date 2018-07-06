module.exports = function chunk (arr, perChunk = 10) {
  return arr.reduce ((sum, item, index) => {
    const chunkIdx = Math.floor (index / perChunk);
    if (!sum[chunkIdx]) {
      sum[chunkIdx] = [];
    }
    sum[chunkIdx].push (item);
    return sum;
  }, []);
};
