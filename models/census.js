const mongoose = require("mongoose")

const CensusSchema = new mongoose.Schema({
  nutsId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  levelCode: {
    type: Number,
    required: true,
  },
  geoLevelCode: {
    type: String,
    required: true,
  },
  censusAttributes: {
    population: String,
    households: String,
    avgHouseholdIncome: String,
    avgPropertyValue: String,
    homeOwnershipRate: Number
  }
})

CensusSchema.set("timestamps", true)
CensusSchema.set("toJSON", { virtuals: true })
CensusSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Census", CensusSchema)
