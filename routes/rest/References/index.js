const Reference = require("../../../models/reference")

module.exports = {
  async(req, res) {
    try {
      return res.status(200).json({ })
    } catch (err) {
      return res.status(500).json({ error: true, message: err.message })
    }
  }

}
