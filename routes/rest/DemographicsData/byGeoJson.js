const Joi = require("joi")
const mongoose = require("mongoose")

const execa = require("execa")
const fs = require("fs/promises")
const { rimraf } = require("rimraf")
const cuid = require("cuid")

const Reference = require("../../../models/reference")
const Census = require("../../../models/census")

module.exports = {
  /**
 * @api {post} /demographicdata/geojson Search By GeoJSON
 * @apiName ByGeoJson
 * @apiGroup Demographic Data
 * @apiVersion 1.0.0
 * @apiHeader {String} Authorization The API-key
 *
 * @apiBody {Object} geojson GeoJSON data containing features for search
 * @apiBody {Array} censusAttributes List of censusAttributes to retrieve
 *
 * @apiSuccessExample {json} Success-Response:200
 * {
 *   "error": false,
 *   "censusData": [
 *     {
 *       "name": "Households",
 *       "attribute": "EU_E002",
 *       "value": 2234,
 *       "description": "Number of households"
 *     }
 *   ]
 * }
  */
  async byGeojson(req, res) {
    const reqId = cuid() // unique identifier for the endpoint call
    try {
      const { geojson, censusAttributes } = req.body

      if (geojson === undefined) {
        return res.status(400).json({ error: true, message: "geojson field is required" })
      }

      if (!Array.isArray(censusAttributes) || censusAttributes.length === 0) {
        return res
          .status(400)
          .json({ error: true, message: "censusAttributes must be a valid array" })
      }

      const schema = Joi.object().keys({
        type: Joi.string().required().valid("FeatureCollection"),
        features: Joi.array().length(1).required().items(
          Joi.object().keys({
            type: Joi.string().required().valid("Feature"),
            geometry: Joi.object().required().keys({
              type: Joi.string().required().valid("Polygon"),
              coordinates: Joi.array().items(
                Joi.array().items(
                  Joi.array().length(2).items(
                    Joi.number().min(-180).max(180),
                    Joi.number().min(-90).max(90)
                  )
                )
              )
            })
          }).unknown()
        )
      }).unknown()

      try {
        await schema.validateAsync(geojson)
      } catch (joiErr) {
        req.logger.error(joiErr)
        return res.status(400).json({ error: true, message: "Please provide valid geojson." })
      }

      const [{ geometry }] = geojson.features
      const regions = await mongoose.model("Region").find({
        centroid: {
          $geoWithin: {
            $geometry: geometry
          }
        }
      })
        .lean()
        .exec()

      const nutsIds = regions.map(({ nutsId }) => (nutsId))

      const query = { nutsId: { $in: nutsIds } }

      const [censusDocs = {}, references] = await Promise.all([
        Census.find(query).lean().exec(),
        Reference.find({ attribute: { $in: censusAttributes } }).lean().exec()
      ])

      // Create temporary file with census data
      await fs.writeFile(`./tmp/${reqId}.json`, JSON.stringify(censusDocs), "utf-8")

      // Call Python script
      const { stdout } = await execa(process.env.PYTHON_EXE_PATH, [
        process.env.CENSUS_AGGREGATOR_SCRIPT_PATH,
        `./tmp/${reqId}.json`
      ])

      const sanitizedOutput = stdout.replace(/NaN/g, "null")
      const censusData = JSON.parse(sanitizedOutput)
      // console.log("censusData ==> ", censusData)

      return res.status(200).json({
        error: false,
        // levelCode,
        censusData: censusData.map((obj) => ({
          countryCode: obj.countryCode,
          censusAttributes: censusAttributes.map((attr) => {
            const ref = references.find((r) => r.attribute === attr)
            return {
              name: ref?.name,
              attribute: attr,
              value: obj.censusAttributes[attr] || null,
              description: ref?.description
            }
          })
        }))
      })
    } catch (err) {
      return res.status(500).json({
        error: true,
        message: err.message
      })
    } finally {
      // Remove temporary file
      await rimraf(`./tmp/${reqId}.json`)
    }
  }
}
