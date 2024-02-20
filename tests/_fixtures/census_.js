module.exports = function (census) {
  return census.createIndexes([
    { key: { nutsId: 1 }, name: "nutsId_1" }
  ])
}
