module.exports = function (regions) {
  return regions.createIndexes([
    { key: { name: "text" }, name: "text_index" },
    { key: { centroid: "2dsphere" }, name: "2dsphere_index" },
    { key: { geometry: "2dsphere" }, name: "2dsphere_index1" },
    { key: { nutsId: 1 }, name: "nutsId_1" }
  ])
}
