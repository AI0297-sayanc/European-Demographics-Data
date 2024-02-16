const Region = require("../../../models/region")
const radiusConvert = require("../../../lib/radiusConvert")

module.exports = {
  async byRadius(req, res) {
    try {
      const { nutsId, radius, levelCodes = [] } = req.body

      const findOneQuery = { nutsId }

      if (levelCodes.length > 0) {
        findOneQuery.levelCode = { $in: levelCodes }
      }

      const data = await Region.findOne(findOneQuery)
        .lean()
        .exec()

      console.log("data ==> ", data)
      const regions = await Region.find(
        {
          centroid: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [Number(data.centroid.coordinates[0]), Number(data.centroid.coordinates[1])] },
              $maxDistance: Number(radiusConvert.miles2meters(radius)), // convert input radius in miles to meters
            }
          },
          levelCode: data.levelCode
        },
      )
        .select("-_id -centroid -geometry -nutsId")
        .lean()
        .exec()

      return res.status(200).json({ error: false, regions })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
