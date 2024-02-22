const Region = require("../../../models/region")
const radiusConvert = require("../../../lib/radiusConvert")

module.exports = {
  /**
   *
   * @api {post} /regionsearch/radius Search By radius
   * @apiName Byradius
   * @apiGroup Region Search
   * @apiVersion  1.0.0
   * @apiHeader {String} Authorization The API-key"
   *
   * @apiBody {String} nutsId Enter nutsId of the given point
   * @apiBody {Number} radius Enter scaler distance/radius in terms of miles
   * @apiBody {Number[]} levelCodes[] Enter list of level code in array
   *
   * @apiSuccessExample {json} Success-Response:200
   * {
    "error": false,
    "regions": [
        {
            "nutsId": "DK050",
            "name": "Province Nordjylland",
            "levelCode": 2,
            "geoLevelName": "Provinces",
            "parentId": "DK05",
            "countryCode": "DK"
        }
    ]
  }
  */

  async byRadius(req, res) {
    try {
      const { nutsId, radius, levelCodes = [] } = req.body

      // Validation...
      if (typeof nutsId !== "string" || nutsId.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'nutsId' must be valid string !!!" })
      }
      if (typeof radius !== "number") {
        return res
          .status(400)
          .json({
            error: true,
            message: "Field 'radius' must be valid number !!!",
          })
      }
      // eslint-disable-next-line max-len, no-restricted-globals
      if (!Array.isArray(levelCodes) || levelCodes.length === 0 || !levelCodes.every((ele) => !isNaN(ele))) {
        return res.status(400).json({ error: true, message: "Field 'levelCodes' must be non empty array !!!" })
      }
      // Validation end....

      const upperNutsId = nutsId.toUpperCase()
      const centroidRegion = await Region.findOne({ nutsId: upperNutsId }).lean().exec()

      if (centroidRegion == null) {
        return res.status(400).json({ error: true, message: "No centroidRegion found !!" })
      }

      const query = {
        centroid: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [
                Number(centroidRegion.centroid.coordinates[0]),
                Number(centroidRegion.centroid.coordinates[1]),
              ],
            },
            $maxDistance: Number(radiusConvert.miles2meters(radius)), // convert input radius in miles to meters
          },
        },
        ...({ levelCode: { $in: levelCodes } })
      }
      const regions = await Region.find(query)
        .select("-_id -centroid -geometry")
        .lean()
        .exec()

      return res.status(200).json(
        {
          error: false,
          count: regions.length,
          regions
        }
      )
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
