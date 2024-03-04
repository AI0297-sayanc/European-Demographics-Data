const Region = require("../../../models/region/index")

module.exports = {
  /**
  * @api {get} /reverseLookup/adjacent/:nutsId?levelcode Get Adjacent Regions by Nuts Id and Level Code
  * @apiName Search Adjacent
  * @apiGroup Reverselookups
  * @apiVersion  1.0.0
  * @apiHeader {String} Authorization The API-key"
  *
  * @apiParam {String} nutsId NutsId of the region to search for adjacent regions.
  * @apiParam {Number} levelCode Level code of the region to filter adjacent regions.
  *
  * @apiSuccess {Boolean} error Indicates if an error occurred during the request.
  * @apiSuccess {Object[]} regions List of adjacent regions.
  * @apiSuccess {String} regions.nutsId NutsId of the adjacent region.
  * @apiSuccess {String} regions.name Name of the adjacent region.
  * @apiSuccess {Number} regions.levelCode Level code of the adjacent region.
  * @apiSuccess {String} regions.geoLevelName Geographical level name of the adjacent region.
  * @apiSuccess {String} regions.parentId Parent Id of the adjacent region.
  * @apiSuccess {String} regions.countryCode Country code of the adjacent region.
  *
  * @apiSuccessExample {json} Success-Response: 200
    {
      "error": false,
      "regions": [
        {
          "nutsId": "DK01",
          "name": "Region Hovedstaden",
          "countryCode": "DK",
          "levelCode": 1,
          "parentId": null,
          "geoLevelName": "Regions"
        }
      ]
    }

  */
  async searchAdjacent(req, res) {
    try {
      const { nutsId, levelCode } = req.params
      const region = await Region.findOne({
        nutsId
      })
        .select("adjacentRegions")
        .lean()
        .exec()
      if (region === null) return res.status(400).json({ error: true, message: `No such nuts id ${nutsId}` })

      const adjacentRegions = await Region.find({
        nutsId: { $in: region.adjacentRegions },
        levelCode
      })
        .select("-_id nutsId name levelCode geoLevelName parentId countryCode")
        .lean()
        .exec()
      return res.status(200).json({ error: false, regions: adjacentRegions })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
