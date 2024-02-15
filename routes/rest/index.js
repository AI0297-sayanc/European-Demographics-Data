const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const Reference = require("./References")

// const test = require("./test")

// router.post("/test", test.test)

// route for References
router.get("/references/attributes", Reference.attributes)
router.get("/references/levels/:countryCode", Reference.levelsByCountryCode)
router.get("/references/countries", Reference.countries)

module.exports = router
