module.exports = ({
  isLatitude(num) { return Number.isFinite(+num) && Math.abs(+num) <= 90 },
  isLongitude(num) { return Number.isFinite(+num) && Math.abs(+num) <= 180 }
})
