module.exports = {
  async authMiddleware(req, res, next) {
    const allowedApiKeysString = process.env.API_KEYS
    if (typeof allowedApiKeysString !== "string" || allowedApiKeysString.trim() === "") {
      return res.status(500).json({ error: true, message: "API key not configured." })
    }

    const apiKey = req.headers["x-api-key"]
    if (apiKey === undefined) {
      return res.status(401).json({ error: true, message: "API key is missing" })
    }

    const allowedApiKeys = allowedApiKeysString.split(",")

    const isValidApiKey = allowedApiKeys.includes(apiKey)
    if (!isValidApiKey) {
      return res.status(403).json({ error: true, message: "Invalid API Key" })
    }

    return next()
  }
}
