const Region = require("../../../models/region")
const Census = require("../../../models/census")
const Reference = require("../../../models/reference")
const radiusConvert = require("../../../lib/radiusConvert")

module.exports = {
  /**
   *
   * @api {post} /demographicdata/radius Search By radius
   * @apiName Byradius
   * @apiGroup Demographic Data
   * @apiVersion  1.0.0
   * @apiHeader {String} Authorization The API-key"
   *
   * @apiBody {String} nutsId Enter nutsId of the given point
   * @apiBody {Number} radius Enter scaler distance/radius in terms of miles
   * @apiBody {String} countryCode Enter countryCode of the given country
   * @apiBody {Number} levelCode Enter level code in given point
   * @apiBody {Number[]} censusAttribute[] Enter list of censusAttribute in an array
   *
   * @apiSuccessExample {json} Success-Response:200
   {
  "error": false,
  "censusData": [
    {
      "name": "HH",
      "value": 2234,
      "attribute": "EU_E002",
      "description": "Number of households"
    }
  ]
}
  */

  async byRadius(req, res) {
    try {
      const {
        nutsId, radius, countryCode = null, levelCode = null, censusAttributes
      } = req.body
      const query = {}

      // Validation....
      if (typeof nutsId !== "string" || nutsId.trim() === "") {
        return res
          .status(400)
          .json({
            error: true,
            message: "Field 'nutsId must be non empty string !!!",
          })
      }
      // eslint-disable-next-line no-restricted-globals
      if (typeof radius !== "number") {
        return res
          .status(400)
          .json({
            error: true,
            message: "Field 'radius' must be valid number !!!",
          })
      }

      if (countryCode !== null) {
        if (typeof countryCode !== "string" || countryCode.trim() === "") return res.status(400).json({ error: true, message: "Field 'countryCode' must be a valid string" })
        query.countryCode = countryCode
      }

      if (levelCode !== null) {
        // eslint-disable-next-line no-restricted-globals
        if (typeof levelCode !== "number" || isNaN(levelCode)) return res.status(400).json({ error: true, message: "Field 'levelcode' must be a valid number!" })
        query.levelCode = levelCode
      }

      // if (
      //   Array.isArray(censusAttribute)
      //   || censusAttribute.length > 0
      //   || censusAttribute.every((ele) => typeof ele === "string")
      // ) {
      //   query.censusAttribute = { $in: censusAttribute }
      // } else {
      //   return res
      //     .status(400)
      //     .json({
      //       error: true,
      //       message:
      //         "Field 'censusAttribute' must be non empty array of string !!!",
      //     })
      // }
      query.nutsId = nutsId
      // query.censusAttribute = censusAttribute

      const upperNutsId = nutsId.toUpperCase()
      const data = await Region.findOne({ nutsId: upperNutsId }).lean().exec()

      if (data == null) {
        return res
          .status(400)
          .json({ error: true, message: "No data found !!" })
      }
      const nutsIds = await Region.find({
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
      })
        .select("-_id nutsId")
        .lean()
        .exec()
      query.nutsId = nutsId
      const nutsArray = nutsIds.map((x) => x.nutsId)
      // const query = {}

      // for nutsid
      if (nutsArray && Array.isArray(nutsArray)) {
        query.nutsId = { $in: nutsArray }
      } else {
        return res.status(400).json({ error: true, message: "nutsIds must be an array" })
      }
      if (!Array.isArray(censusAttributes)) {
        return res.status(400).json({ error: true, message: "censusAttributes must be an array" })
      }

      const pipeline = [
        {
          $match: {
            ...query
          }
        },
        {
          $project: {
            _id: 0,
            nutsId: "$nutsId",
            name: "$name",
            levelCode: "$levelcode",
            geoLevelName: 1,
            countryCode: 1,
            ...censusAttributes.reduce((acc, attr) => {
              acc[attr] = `$censusAttributes.${attr}`
              return acc
            }, {})
          }
        },
        {
          $group: {
            _id: null,
            ...censusAttributes.reduce((acc, attr) => {
              acc[attr] = { $sum: `$${attr}` }
              return acc
            }, {})

          }
        }
      ]
      // console.log("pipeline", JSON.stringify(pipeline, null, 2))
      const [[censusData = {}], references] = await Promise.all([
        Census.aggregate(pipeline),
        Reference.find({ attribute: censusAttributes }).lean().exec()
      ])
      // console.log(censusData);

      return res.status(200).json({
        error: false,
        censusData: Object.keys(censusData)
          .filter((el) => el !== "_id")
          .map((attr) => {
            const ref = references.find((r) => r.attribute === attr)
            return {
              name: ref?.name,
              attribute: attr,
              value: censusData[attr],
              description: ref?.description
            }
          })
      })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
