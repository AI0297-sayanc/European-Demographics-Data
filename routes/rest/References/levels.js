const Reference = require("../../../models/reference")
const Level = require("../../../models/level")

module.exports = {
  /**
 * @api {get} /references/levels/:countryCode Retrieve Levels by Country Code
 * @apiName Retrieve Levels by Country Code
 * @apiGroup References
 * @apiVersion 1.0.0
 *
 * @apiParam {String} countryCode Path parameter for filtering levels by country code.
 *
 * @apiSuccessExample {json} Success-Response: 200
 {
    "error": false,
    "levels": [
        {
            "_id": "65c9fafa7c9694b5773cef5b",
            "levelCode": 1,
            "levelName": "Regions",
            "countryCode": "IT",
            "countryName": "Italy"
        },
        {
            "_id": "65c9fafa7c9694b5773cef5c",
            "levelCode": 2,
            "levelName": "Provinces",
            "countryCode": "IT",
            "countryName": "Italy"
        },
        {
            "_id": "65c9fafa7c9694b5773cef5d",
            "levelCode": 3,
            "levelName": "Municipality",
            "countryCode": "IT",
            "countryName": "Italy"
        }
    ]
}
 */
  async levelsByCountryCode(req, res) {
    const { countryCode } = req.params

    try {
      if (countryCode === undefined) {
        return res.status(400).json({ error: true, message: "Country code is required!!!" })
      }

      // Convert to uppercase
      const uppercaseCountryCode = await countryCode.toUpperCase()

      const levels = await Level.find({ countryCode: uppercaseCountryCode })
        .sort({ levelCode: 1 })
        .lean()
        .exec()
      if (levels.length === 0) return res.status(400).json({ error: true, message: "Please enter a valid country code" })
      return res.status(200).json({ error: false, levels })
    } catch (error) {
      return res.status(400).json({ error: true, message: error.message })
    }
  }
}
