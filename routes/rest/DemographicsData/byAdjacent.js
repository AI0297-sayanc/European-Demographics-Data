const execa = require("execa")
const fs = require("fs/promises")
const { rimraf } = require("rimraf")
const cuid = require("cuid")

const Region = require("../../../models/region")
const Reference = require("../../../models/reference")
const Census = require("../../../models/census")

module.exports = {
  async byAdjacent(req, res) {
    const reqId = cuid()
    try {
      const {
        nutsId,
        censusAttributes,
        countryCode = null,
        levelCode = 3
      } = req.body

      const query = {}

      if (typeof nutsId !== "string" || nutsId.trim() === "") {
        return res.status(400).json({ error: true, message: "Field 'nutsId' must be a non-empty string!!!" })
      }

      if (!Array.isArray(censusAttributes) || censusAttributes.length === 0) {
        return res.status(400).json({
          error: true,
          message: "censusAttributes must be an array and should not be empty"
        })
      }

      if (countryCode !== null && countryCode !== undefined) {
        if (typeof countryCode !== "string" || countryCode.trim() === "") {
          return res.status(400).json({
            error: true,
            message: "Field 'countryCode' must be a valid string"
          })
        }
        query.countryCode = countryCode
      }

      // eslint-disable-next-line no-restricted-globals
      if (typeof levelCode !== "number" || isNaN(levelCode)) {
        return res.status(400).json({
          error: true,
          message: "Field 'levelCode' must be a valid number!"
        })
      }
      query.levelCode = levelCode

      // Find the center region based on nutsId
      const centerRegion = await Region.findOne({ nutsId })
      if (centerRegion == null) {
        return res
          .status(400)
          .json({ error: true, message: "No centroidRegion found !!" })
      }

      const nutsIds = [nutsId, ...centerRegion.adjacentRegions]

      const upperNutsIds = nutsIds.map((id) => id.toUpperCase())
      query.nutsId = {
        $in: upperNutsIds
      }

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
        levelCode,
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
