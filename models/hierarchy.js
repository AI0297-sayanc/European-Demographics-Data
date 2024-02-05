const mongoose = require("mongoose")

const HierarchySchema = new mongoose.Schema({
  nutsId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  levlCode: {
    type: Number
  },
  geoLvlName: {
    type: String
  },
  upperlvlId: {
    type: String
  }

})

HierarchySchema.set("timestamps", true)
HierarchySchema.set("toJSON", { virtuals: true })
HierarchySchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Hierarchy", HierarchySchema)
