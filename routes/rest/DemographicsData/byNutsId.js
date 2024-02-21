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
 *  */
  async byNutsId(req, res) {
    try {
      const { nutsIds, censusAttributes } = req.body

      const query = {}

      if (!Array.isArray(nutsIds)) {
        return res.status(400).json({ error: true, message: "nutsIds must be an array" })
      }
      if (!Array.isArray(censusAttributes)) {
        return res.status(400).json({ error: true, message: "censusAttributes must be an array" })
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
      const [[censusData], references] = await Promise.all([
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
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    }
  }
}
