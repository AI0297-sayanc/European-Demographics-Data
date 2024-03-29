const Region = require("../../../models/region/index")

module.exports = {
  /**
 * @api {get} reverseLookup/point Retrieve Regions Information
 * @apiName Retrieve Regions Information
 * @apiGroup Locations
 * @apiVersion 1.0.0
 *
 * @apiSuccessExample {json} Success-Response:200
 * {
 *   "error": false,
 *   "regions": [
 *     {
 *       "nutsId": "DK04",
 *       "name": "Region Midtjylland",
 *       "levelCode": 1,
 *       "geoLevelName": "Regions",
 *       "parentId": null
 *     },
 *
 *   ]
 * }
 */
  async searchByLongLat(req, res) {
    try {
      const
        { long, lat } = req.query
      // validation start.........

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(long)) || long > 180 || long < -180 || long === null) {
        return res.status(400).json({ error: true, message: "Field 'long' not valid !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(lat)) || lat > 90 || lat < -90 || lat === null) {
        return res.status(400).json({ error: true, message: "Field 'lat' not valid !!!" })
      }
      // validation end

      const regions = await Region.find(
        {
          geometry: {
            $geoIntersects: {
              $geometry: {
                type: "Point",
                coordinates: [Number(long), Number(lat)],
              }
            },
          },
        }
      )
        .select("-_id nutsId name levelCode geoLevelName parentId countryCode")
        .sort({ levelCode: -1 })
        .lean()
        .exec()

      return res.status(200).json({ error: false, regions })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
