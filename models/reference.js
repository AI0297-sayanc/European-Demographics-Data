const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const ReferenceSchema = new mongoose.Schema({

  attribute: {
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

  countryCode: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    default: null,
  },
  source: {
    type: String,
    default: null,
  },
  sourceName: {
    type: String,
    default: null,
  },
  description: String,
  currencyCode: {
    type: String,
    default: null,
  }
})

ReferenceSchema.set("timestamps", true)
ReferenceSchema.set("toJSON", { virtuals: true })
ReferenceSchema.set("toObject", { virtuals: true })
ReferenceSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("Reference", ReferenceSchema)
