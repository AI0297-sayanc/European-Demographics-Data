const Region = require("../../../models/region")

module.exports = {
  /**
  * @api {get} /geometry/:nutsId Get geometry by Nuts Id
  * @apiName ByNutsId
  * @apiGroup Geometry
  * @apiVersion  1.0.0
  * @apiHeader {String} Authorization The API-key"
  *
  * @apiParam {String} nutsId NutsId of the region to search.
  *
  * @apiSuccessExample {json} Success-Response: 200
    {
      "error": false,
      "nutsId": "DK159",
      "name": "Gladsaxe",
      "levelCode": 3,
      "geoLevelName": "Municipalities",
      "parentId": "DK012",
      "countryCode": "DK",
      "centroid": {
      "type": "point",
      "coordinates": [
      12.470167490157134,
      55.747539659747865
    ]
    },
      "geometry": {
      "type": "polygon",
      "coordinates": [
    [
    [
      12.500527,
      55.759562
    ]
    ]
    ]
    }
    }
  */
  async byNutsId(req, res) {
    try {
      const { nutsId } = req.params
      const geometry = await Region.findOne({
        nutsId
      })
        .select("-_id -adjacentRegions")
        .lean()
        .exec()
      if (geometry === null) return res.status(400).json({ error: true, message: `No such nuts id ${nutsId}` })

      return res.status(200).json({ error: false, ...geometry })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
