const Region = require("../../../models/region")

module.exports = {
  /**
  * @api {get} /searchIdentifiers/byname Retrieve Regions Information
  * @apiName Retrieve Regions Information
  * @apiGroup Search Identifiers
  * @apiVersion 1.0.0
  *
  * @apiParam {String} name Region name for searching.
  * @apiParam {Number} [levelCode] Level code for filtering regions.
  * @apiParam {String} [countryCode] Country code for filtering regions.
  * @apiParam {Number} [page=1] Page number for pagination.
  * @apiParam {Number} [size=10] Number of items per page for pagination.
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
  *     }
  *   ],
  *   "totalData": 1,
  *   "totalPages": 1,
  *   "page": 1,
  *   "size": 10
  * }
  */
  async searchByName(req, res) {
    try {
      const {
        name, levelCode, countryCode, page = 1, size = 10
      } = req.query

      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'name' not in a valid format!!!" })
      }

      const query = { $text: { $search: name } }
      if (name !== undefined) query.name = name

      if (levelCode !== undefined) query.levelCode = levelCode
      if (countryCode !== undefined) query.countryCode = countryCode

      const paginationOptions = {
        page,
        limit: size,
        lean: true,
        select: "-_id -centroid -geometry -adjacentRegions",
        sort: { _id: -1 }
      }
      const {
        docs,
        totalDocs,
        totalPages
      } = await Region.paginate(
        query,
        paginationOptions
      )

      return res.status(200).json({
        error: false,
        regions: docs,
        totalData: totalDocs,
        totalPages,
        page: Number(page),
        size: Number(size)
      })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
