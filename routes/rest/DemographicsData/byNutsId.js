const Reference = require("../../../models/reference")
const Census = require("../../../models/census")

module.exports = {

  async byNutsId(req, res) {
    try {
      const { nutsIds, censusAttributes } = req.body

      const query = {}

      // for nutsid
      if (nutsIds && Array.isArray(nutsIds)) {
        query.nutsId = { $in: nutsIds }
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
