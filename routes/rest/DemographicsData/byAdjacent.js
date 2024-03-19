const { rimraf } = require("rimraf")
const cuid = require("cuid")

const Reference = require("../../../models/reference")
const Census = require("../../../models/census")
const Region = require("../../../models/region")

module.exports = {
  async byAdjacent(req, res) {
    const reqId = cuid() // unique identifier for the endpoint call
    try {
      const { nutsId, censusAttributes, levelCode } = req.body

      // null test.............
      if (nutsId === undefined) {
        return res.status(400).json({
          error: true,
          message: "nutsId is required and cannot be null",
        })
      }

      if (!Array.isArray(censusAttributes) || censusAttributes.length === 0) {
        return res.status(400).json({
          error: true,
          message: "censusAttributes must be a valid array",
        })
      }

      // eslint-disable-next-line no-restricted-globals
      if (typeof levelCode !== "number" || isNaN(levelCode)) {
        return res.status(400).json({
          error: true,
          message: "Field 'levelCode' must be a valid number!",
        })
      }

      const centralRegion = await Region.findOne({ nutsId })
        .select("nutsId adjacentRegions")
        .lean()
        .exec()

      // const nutsIds = [nutsId, ...centralRegion.adjacentRegions]
      let nutsIds = [nutsId]
      if (centralRegion && Array.isArray(centralRegion.adjacentRegions)) {
        nutsIds = [...nutsIds, ...centralRegion.adjacentRegions]
      }

      const [censusDocs = {}, references] = await Promise.all([
        Census.find({ nutsId: { $in: nutsIds }, levelCode })
          .lean()
          .exec(),
        Reference.find({ attribute: { $in: censusAttributes } })
          .lean()
          .exec(),
      ])

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
      return res.status(500).json({
        error: true,
        message: err.message,
      })
    } finally {
      // Remove temporary file
      await rimraf(`./tmp/${reqId}.json`)
    }
  },
}
