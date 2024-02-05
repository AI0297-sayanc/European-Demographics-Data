const mongoose = require("mongoose")
const longLat = require("../../lib/latLong")

class CoordinatePair extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, "CoordinatePair")
  }

  // eslint-disable-next-line class-methods-use-this
  cast(val) {
    if (!Array.isArray(val)) throw new Error("Not an array!!!")
    if (val.length !== 2) throw new Error("Must be of size 2!!!")
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(val[0]) || isNaN(val[1])) throw new Error("Non numeric!!!!")
    if (!longLat) throw new Error("longitude and latitude must be in range")
    return val
  }
}

module.exports = CoordinatePair
