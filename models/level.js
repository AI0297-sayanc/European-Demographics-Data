const mongoose = require("mongoose")

const LevelSchema = new mongoose.Schema({
  levelCode: {
    type: Number,
    required: true,
  },
  levelName: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  countryName: {
    type: String,
    required: true,
  }
})

LevelSchema.set("timestamps", true)
LevelSchema.set("toJSON", { virtuals: true })
LevelSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Level", LevelSchema)
