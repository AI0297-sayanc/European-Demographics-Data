const Region = require("../../../models/region/index")

module.exports = {
  async searchAdjacent(req, res) {
    try {
      const { nutsId } = req.params
      const region = await Region.findOne({
        nutsId
      })
        .select("centroid levelCode adjacentRegions")
        .lean()
        .exec()
      if (region === null) return res.status(400).json({ error: true, message: `No such nuts id ${nutsId}` })

      const adjacentRegions = await Region.find({ nutsId: { $in: region.adjacentRegions } })
        .select("nutsId centroid levelCode")
        .lean()
        .exec()
      return res.status(200).json({ error: false, adjacentRegions })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
