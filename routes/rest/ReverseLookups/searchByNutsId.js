const Region = require("../../../models/region/index")

module.exports = {
  /**
 * @api {get} /reverseLookup/nutsid/{nutsId} Search Regions by Nuts ID
 * @apiName Search Regions by Nuts ID
 * @apiGroup Regions
 * @apiVersion 1.0.0
 *
 * @apiParam {String} nutsId Nuts ID of the region.
 *
 * @apiSuccessExample {json} Success-Response:200
 * {
 *   "error": false,
 *   "searchByNutsId": [
 *     {
 *       "nutsId": "DK05",
 *       "name": "Region Syddanmark",
 *       "levelCode": 1,
 *       "geoLevelName": "Regions",
 *       "parentId": null
 *     },
 *   ]
  *
}
  */
  async searchByNutsId(req, res) {
    try {
      const { nutsId } = req.params

      const region = await Region.findOne({
        nutsId
      })
        .select("centroid levelCode")
        .lean()
        .exec()
      // console.log(getNutsId);
      if (region === null) return res.status(400).json({ error: true, message: `No such nuts id ${nutsId}` })

      const regions = await Region.find({
        levelCode: { $lt: region.levelCode },
        geometry: {
          $geoIntersects: {
            $geometry: region.centroid
          },
        },
      })
        .select("-_id nutsId name levelCode geoLevelName parentId countryCode ")
        .sort({ levelCode: -1 })
        .lean()
        .exec()
      return res.status(200).json({ error: false, regions })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
