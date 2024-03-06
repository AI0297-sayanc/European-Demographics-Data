const Joi = require("joi")
const mongoose = require("mongoose")

module.exports = {
  async byGeojson(req, res) {
    try {
      const { geojson, censusAttributes } = req.body

      if (geojson === undefined) {
        return res.status(400).json({ error: true, message: "geojson field is required" })
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
        return res.status(400).json({ error: true, message: "Please provide valid geojson data with a single feature whose geometry type is a Polygon!" })
      }

      const [{ geometry }] = geojson.features
      const regions = await mongoose.model("Region").find({
        centroid: {
          $geoWithin: {
            $geometry: geometry
          }
        }
      })

      const nutsIds = regions.map(({ nutsId }) => (nutsId))

      if (!Array.isArray(censusAttributes)) {
        return res.status(400).json({ error: true, message: "censusAttributes must be an array" })
      }

      const query = { nutsId: { $in: nutsIds } }

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

      const [[censusData = {}], references] = await Promise.all([
        mongoose.model("Census").aggregate(pipeline),
        mongoose.model("Reference").find({ attribute: censusAttributes }).lean().exec()
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
    } catch (error) {
      req.logger.error(error)
      return res.status(500).json({ error: true, message: error.message })
    }
  }
}
