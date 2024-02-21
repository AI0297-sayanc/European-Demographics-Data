const Reference = require("../../../models/reference")
const Level = require("../../../models/level")

module.exports = {
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

}
