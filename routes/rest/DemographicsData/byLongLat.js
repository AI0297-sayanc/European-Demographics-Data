const { rimraf } = require("rimraf")
const cuid = require("cuid")

const Reference = require("../../../models/reference")
const Census = require("../../../models/census")
const Region = require("../../../models/region")

module.exports = {
  async byLongLat(req, res) {
    const reqId = cuid() // unique identifier for the endpoint call
    try {
      const {
        long, lat, censusAttributes, levelCode = 3
      } = req.body

      // Validations
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(long)) || long > 180 || long < -180 || long === null) {
        return res
          .status(400)
          .json({ error: true, message: "Field 'long' not valid !!!" })
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(String(lat)) || lat > 90 || lat < -90 || lat === null) {
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
      const centralRegion = await Region.find({
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
        .sort({ levelCode: -1 })
        .lean()
        .exec()

      // Extract region IDs including central region and adjacent regions
      const regions = centralRegion.map((region) => region.nutsId)

      // Fetch census data for the regions
      const [censusDocs = {}, references] = await Promise.all([
        Census.find({ nutsId: { $in: regions }, levelCode })
          .lean()
          .exec(),
        Reference.find({ attribute: { $in: censusAttributes } })
          .lean()
          .exec(),
      ])

      // Format response
      return res.status(200).json({
        error: false,
        levelCode,
        censusData: censusDocs.map((obj) => ({
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
