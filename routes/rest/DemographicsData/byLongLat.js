const execa = require("execa")
const fs = require("fs/promises")
const { rimraf } = require("rimraf")
const cuid = require("cuid")
const { isLongitude, isLatitude } = require("../../../lib/latLong")

const Reference = require("../../../models/reference")
const Census = require("../../../models/census")
const Region = require("../../../models/region")

module.exports = {
  async byLongLat(req, res) {
    const reqId = cuid()
    try {
      const {
        long, lat, censusAttributes, levelCode = 3
      } = req.body

      // Validations
      if (!isLongitude(long)) {
        return res
          .status(400)
          .json({ error: true, message: "Field 'long' not valid !!!" })
      }

      if (!isLatitude(lat)) {
        return res
          .status(400)
          .json({ error: true, message: "Field 'lat' not valid !!!" })
      }

      if (!Array.isArray(censusAttributes) || censusAttributes.length === 0) {
        return res
          .status(400)
          .json({
            error: true,
            message: "censusAttributes must be a valid array",
          })
      }
      // eslint-disable-next-line no-restricted-globals
      if (typeof levelCode !== "number" || isNaN(levelCode)) {
        return res
          .status(400)
          .json({
            error: true,
            message: "Field 'levelCode' must be a valid number!",
          })
      }

      // Find central region
      const centralRegion = await Region.findOne({
        levelCode,
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [Number(long), Number(lat)],
            },
          },
        },
      })
        .select(
          "-_id nutsId name levelCode geoLevelName parentId countryCode adjacentRegions"
        )
        .lean()
        .exec()

      if (centralRegion === null) return res.status(400).json({ error: true, message: "No such region!" })

      // Extract region IDs including central region and adjacent regions
      const adjacentRegions = centralRegion.adjacentRegions.map((region) => region.nutsId)

      // Fetch census data for the regions
      const [censusDocs = {}, references] = await Promise.all([
        Census.find({
          nutsId: { $in: [centralRegion.nutsId, ...adjacentRegions] },
          levelCode
        })
          .lean()
          .exec(),
        Reference.find({ attribute: { $in: censusAttributes } })
          .lean()
          .exec(),
      ])

      await fs.writeFile(
        `./tmp/${reqId}.json`,
        JSON.stringify(censusDocs),
        "utf-8"
      )

      const { stdout } = await execa(process.env.PYTHON_EXE_PATH, [
        process.env.CENSUS_AGGREGATOR_SCRIPT_PATH,
        `./tmp/${reqId}.json`,
      ])

      const sanitizedOutput = stdout.replace(/NaN/g, "null")
      const censusData = JSON.parse(sanitizedOutput)

      // Format response
      return res.status(200).json({
        error: false,
        levelCode,
        censusData: censusData.map((obj) => ({
          countryCode: obj.countryCode,
          censusAttributes: censusAttributes.map((attr) => {
            const ref = references.find((r) => r.attribute === attr)
            return {
              name: ref?.name,
              attribute: attr,
              value: obj.censusAttributes[attr] || null,
              description: ref?.description,
            }
          }),
        })),
      })
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    } finally {
      // Remove temporary file
      await rimraf(`./tmp/${reqId}.json`)
    }
  },
}
