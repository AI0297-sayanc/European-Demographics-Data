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
  levelCode: {
    type: Number,
    required: true,
  },
  geoLevelName: {
    type: String,
    required: true,
  },
  parentId: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  centroid: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: CoordinatePair,
  },
  geometry: {
    type: {
      type: String,
      enum: ["MultiPolygon", "Polygon"]
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed
    },
  }
})

RegionSchema.set("timestamps", true)
RegionSchema.set("toJSON", { virtuals: true })
RegionSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Region", RegionSchema)
