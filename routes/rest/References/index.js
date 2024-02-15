const Reference = require("../../../models/reference")
const Level = require("../../../models/level")

module.exports = {
  /**
 * @api {get} /references/attributes Retrieve Reference Attributes
 * @apiName Retrieve Reference Attributes
 * @apiGroup References
 * @apiVersion 1.0.0
 *
 * @apiParam {String} [name] Filter attributes by name.
 * @apiParam {Number} [levelCode] Filter attributes by level code.
 * @apiParam {String} [countryCode] Filter attributes by country code.
 * @apiParam {Number} [page=1] Page number for pagination. Default: 1.
 * @apiParam {Number} [size=10] Number of items per page. Default: 10.
 *
 * @apiSuccessExample {json} Success-Response:200
      {
        "error": false,
        "attribute": [
      {
        "attribute": "EU_E004",
        "name": "MPV",
        "levelCode": 2,
        "countryCode": "AT",
        "date": null,
        "source": null,
        "sourceName": null,
        "description": "Median Property Value",
        "currencyCode": null
      }
      ],
        "totalData": 3,
        "totalPages": 3,
        "page": 1,
        "size": 1
      }
 */

  async attributes(req, res) {
    const {
      name, levelCode, countryCode, page = 1, size = 10
    } = req.query
    try {
      const query = {}

      if (typeof name !== "undefined") {
        query.name = name
      }

      if (typeof levelCode !== "undefined") {
        query.levelCode = levelCode
      }

      if (typeof countryCode !== "undefined") {
        query.countryCode = countryCode
      }

      const paginationOptions = {
        page,
        limit: size,
        select: "-id -_id",
        sort: { attribute: 1 },
        lean: true
      }

      const { docs, totalDocs, totalPages } = await Reference.paginate(query, paginationOptions)

      return res.status(200).json({
        error: false,
        attributes: docs,
        totalData: totalDocs,
        totalPages,
        page: Number(page),
        size: Number(size)
      })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
  /**
 * @api {get} /countries Retrieve Countries with countrycode and countryname
 * @apiName Retrieve Countries
 * @apiGroup References
 * @apiVersion 1.0.0
 * @apiParam {Number} [page=1] Page number for pagination. Default: 1.
 * @apiParam {Number} [size=10] Number of items per page. Default: 10.
 *
* @apiSuccessExample {json} Success-Response:200
    {
    "error": false,
    "countries": [
        {
            "countryCode": "AT",
            "countryName": "Austria"
        }
    ],
    "totalData": 25,
    "totalPages": 25,
    "page": 1,
    "size": 1
}
*/
  async countries(req, res) {
    const { page = 1, size = 10 } = req.query
    try {
      const pipeline = [
        {
          $group: {
            _id: { countryCode: "$countryCode", countryName: "$countryName" }
          }
        },
        {
          $project: {
            _id: 0,
            countryCode: "$_id.countryCode",
            countryName: "$_id.countryName"
          }
        },
        {
          $sort: { countryCode: 1 }
        }
      ]

      const distinctCountries = await Level.aggregate(pipeline)

      const startIndex = (page - 1) * size
      const endIndex = page * size

      const paginatedCountries = distinctCountries.slice(startIndex, endIndex)

      return res.status(200).json({
        error: false,
        countries: paginatedCountries,
        totalData: distinctCountries.length,
        totalPages: Math.ceil(distinctCountries.length / size),
        page: Number(page),
        size: Number(size)
      })
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    }
  },

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
