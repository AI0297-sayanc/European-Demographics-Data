const cuid = require("cuid")
const fs = require("fs").promises
const { rimraf } = require("rimraf")
const execa = require("execa")

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
    const reqId = cuid() // unique identifier for the endpoint call
    try {
      const {
        nutsId, radius, countryCode = null, levelCode = 3, censusAttributes
      } = req.body

      // console.log("censusAttributes ==> ", censusAttributes)
      const query = {}

      // Validation....
      if (typeof nutsId !== "string" || nutsId.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'nutsId must be non empty string !!!" })
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

      if (levelCode === null) {
        return res.status(400).json({ error: true, message: "Field 'levelCode' cannot be null!" })
      }
      if (levelCode !== null) {
        // eslint-disable-next-line no-restricted-globals
        if (typeof levelCode !== "number" || isNaN(levelCode)) return res.status(400).json({ error: true, message: "Field 'levelcode' must be a valid number!" })
        query.levelCode = levelCode
      }

      if (!Array.isArray(censusAttributes)) {
        return res.status(400).json({ error: true, message: "censusAttributes must be an array" })
      }

      const upperNutsId = nutsId.toUpperCase()
      const centerRegion = await Region.findOne({ nutsId: upperNutsId }).lean().exec()

      if (centerRegion == null) {
        return res
          .status(400)
          .json({ error: true, message: "No centroidRegion found !!" })
      }
      const regions = await Region.find({
        ...query,
        centroid: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [
                Number(centerRegion.centroid.coordinates[0]),
                Number(centerRegion.centroid.coordinates[1]),
              ],
            },
            $maxDistance: Number(radiusConvert.miles2meters(radius)), // convert input radius in miles to meters
          },
        },
      })
        .select("-_id nutsId")
        .lean()
        .exec()
      const nutsIds = regions.map((x) => x.nutsId?.toUpperCase())
      // console.log("nutsIds ==> ", nutsIds)

      const [censusDocs = {}, references] = await Promise.all([
        Census.find({ nutsId: { $in: nutsIds } }).lean().exec(),
        Reference.find({ attribute: censusAttributes }).lean().exec()
      ])
      // console.log("censusDocs ==> ", censusDocs)
      // Create temporary file with census data
      await fs.writeFile(`./tmp/${reqId}.json`, JSON.stringify(censusDocs), "utf-8")

      // Call Python script
      const { stdout } = await execa(process.env.PYTHON_EXE_PATH, [
        process.env.CENSUS_AGGREGATOR_SCRIPT_PATH,
        `./tmp/${reqId}.json`
      ])
      const sanitizedOutput = stdout.replace(/NaN/g, "null") // remove NaN values (coming from Python?)
      const censusData = JSON.parse(sanitizedOutput)

      // console.log("censusData ==> ", censusData)

      return res.status(200).json({
        error: false,
        levelCode,
        censusData: censusData
          .map((obj) => ({
            countryCode: obj.countryCode,
            censusAttributes: Object.keys(obj.censusAttributes)
              // .filter((attr) => obj.censusAttributes[attr] !== null)
              .map((attr) => {
                const ref = references.find((r) => r.attribute === attr)
                return {
                  name: ref?.name,
                  attribute: attr,
                  value: obj.censusAttributes[attr],
                  description: ref?.description
                }
              })
          }))
      })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    } finally {
      // Remove temporary file
      await rimraf(`./tmp/${reqId}.json`)
    }
  }
}
