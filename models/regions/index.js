const mongoose = require("mongoose")
// const mongoosePaginate = require("mongoose-paginate-v2")
const CoordinatePair = require("../schemas/coordinate-pair.class")
mongoose.Schema.Types.CoordinatePair = CoordinatePair

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
    type: Number
  },
  countryCode: {
    type: String,
    required: true,
  },
  centroid: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: CoordinatePair
    }
  },
  geometry: {
    type: {
      type: String,
      enum: ["MultiPolygon", "Polygon"],
      required: true
    },
    coordinates: mongoose.Schema.Types.Mixed
  }
})

RegionSchema.set("timestamps", true)
RegionSchema.set("toJSON", { virtuals: true })
RegionSchema.set("toObject", { virtuals: true })
// RegionSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("Region", RegionSchema)
