const Region = require("../../../models/region")
const radiusConvert = require("../../../lib/radiusConvert")

/**
   *
   * @api {post} /regionsearch/radius Search By radius
   * @apiName Byradius
   * @apiGroup Demographics Data
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

module.exports = {
  async byRadius(req, res) {
    try {
      const { nutsId, radius, levelCodes = [] } = req.body
      const upperNutsId = await nutsId.toUpperCase()

      // Validation...
      if (typeof (nutsId) !== "string" || nutsId.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'nutsId' must be valid string !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(radius))) {
        return res.status(400).json({ error: true, message: "Field 'radius' must be valid number !!!" })
      }
      if (levelCodes.length === 0) {
        return res.status(400).json({ error: true, message: "Field 'levelCodes' must be non empty array !!!" })
      }
      // Validation end....

      const data = await Region.findOne({ nutsId: upperNutsId })
        .lean()
        .exec()

      if (data == null) {
        return res.status(400).json({ error: true, message: "No data found !!" })
      }
      const regions = await Region.find({
        centroid: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [
                Number(data.centroid.coordinates[0]),
                Number(data.centroid.coordinates[1]),
              ],
            },
            $maxDistance: Number(radiusConvert.miles2meters(radius)), // convert input radius in miles to meters
          },
        },
        ...(levelCodes.length > 0 && { levelCode: { $in: levelCodes } })
      })
        .select("-_id -centroid -geometry")
        .lean()
        .exec()

      return res.status(200).json({ error: false, regions })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
