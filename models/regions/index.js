const mongoose = require("mongoose")
const CoordinatePair = require("./coordinate-pair.class")

const RegionSchema = new mongoose.Schema({
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
  geoLvlName: {
    type: String,
    required: true,
  },
  cntrCode: {
    type: String,
    required: true,
  },

  centroid: {
    type: {
      type: String,

    },
    coordinates: {
      type: CoordinatePair,
      required: true
    },
    geometry: {
      type: mongoose.Schema.Types.Mixed
    }
  }
})

RegionSchema.set("timestamps", true)
RegionSchema.set("toJSON", { virtuals: true })
RegionSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Region", RegionSchema)
