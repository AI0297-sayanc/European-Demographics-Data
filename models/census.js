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
  levlCode: {
    type: Number,
    required: true,
  },
  geoLvlCodeE: {
    type: String,
    required: true,
  },
  censusAttributes: {
    Population: String,
    HH: String,
    MHI: String,
    MPV: String,
    ownedPercentage: {
      type: Number,
    },
  },
});

CensusSchema.set("timestamps", true)
CensusSchema.set("toJSON", { virtuals: true })
CensusSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Census", CensusSchema)
