const Reference = require("../../../models/reference")
const Census = require("../../../models/census")

module.exports = {
/**
 * @api {post} /demographics/nutsids Retrieve computed data from Census Data by NUTS ID
 * @apiName Retrieve computed data
 * @apiGroup Demographics Data

 * @apiVersion 1.0.0
 *
 * @apiParam {Array} nutsIds Array of NUTS IDs for filtering.
 * @apiParam {Array} censusAttributes Array of census attributes.
 * @apiSuccessExample { json Success-Response: 200
  *     {
  *       "error": false,
  *       "censusData": [
  *         {
  *           "name": "Population",
  *           "attribute": "EU_E002",
  *           "value": 2598816,
  *           "description": "Total Population"
  *

  *   ]
  *
}
  */
  async byNutsId(req, res) {
    try {
      const {
        nutsIds, censusAttributes, countryCode = null, levelCode = null
      } = req.body

      const query = {}

      // validation start....
      if (!Array.isArray(nutsIds) || nutsIds.length === 0) {
        return res.status(400).json({ error: true, message: "nutsIds must be an array and should not be empty" })
      }

      if (!Array.isArray(censusAttributes) || censusAttributes.length === 0) {
        return res.status(400).json({ error: true, message: "censusAttributes must be an array and should not be empty" })
      }

      if (countryCode !== null) {
        if (typeof countryCode !== "string" || countryCode.trim() === "") return res.status(400).json({ error: true, message: "Field 'countryCode' must be a valid string" })
        query.countryCode = countryCode
      }

      if (levelCode !== null) {
        // eslint-disable-next-line no-restricted-globals
        if (typeof levelCode !== "number" || isNaN(levelCode)) return res.status(400).json({ error: true, message: "Field 'levelcode' must be a valid number" })
        query.levelCode = levelCode
      }

      query.nutsId = { $in: nutsIds }

      const pipeline = [
        {
          $match: {
            ...query
          }
        },
        {
          $project: {
            _id: 0,

            ...censusAttributes.reduce((acc, attr) => ({ ...acc, [attr]: `$censusAttributes.${attr}` }), {})
          }
        },
        {
          $group: {
            _id: null,
            ...censusAttributes.reduce((acc, attr) => ({ ...acc, [attr]: { $sum: `$${attr}` } }), {})
          }
        }
      ]
      // console.log("pipeline", JSON.stringify(pipeline, null, 2))
      const [[censusData = {}], references] = await Promise.all([
        Census.aggregate(pipeline),
        Reference.find({ attribute: censusAttributes }).lean().exec()
      ])

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
    } catch (err) {
      console.log("err ==> ", err)
      return res.status(500).json({ error: true, message: err.message })
    }
  }
}
