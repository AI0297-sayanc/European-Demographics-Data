const execa = require("execa")
const fs = require("fs/promises")
const { rimraf } = require("rimraf")
const cuid = require("cuid")

const Reference = require("../../../models/reference")
const Census = require("../../../models/census")

module.exports = {
  async byNutsId(req, res) {
    const reqId = cuid() // unique identifier for the endpoint call
    try {
      const {
        nutsIds,
        censusAttributes,
        countryCode = null,
        levelCode
      } = req.body

      const query = {}

      // Validation start....
      if (!Array.isArray(nutsIds) || nutsIds.length === 0) {
        return res.status(400).json({
          error: true,
          message: "Field 'nutsIds' must be a non-empty array!"
        })
      }

      if (!Array.isArray(censusAttributes) || censusAttributes.length === 0) {
        return res.status(400).json({
          error: true,
          message: "censusAttributes must be an array and should not be empty"
        })
      }

      if (countryCode !== null) {
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
