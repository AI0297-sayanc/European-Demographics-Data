const Region = require("../../../models/regions")

module.exports = {

  async test(req, res) {
    try {
      const
        {
          long, lat, radius // Note: radius input is in MILES
        } = req.body
      const blocks = await Region.find(
        {
          centroid: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [Number(long), Number(lat)] },
              $maxDistance: radius
            }
          }
        },
      )
        .select("-_id -geometry")
        // .populate({ path: "_census" })
        .lean()
        .exec()
      return res.status(200).json({ error: false, blocks })
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message })
    }
  },
}
