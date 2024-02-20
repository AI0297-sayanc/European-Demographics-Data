const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const Reference = require("./References")
const regionSearchRadius = require("./Regions Search")
// const test = require("./test")

// router.post("/test", test.test)

// Regions Search routes....
router.post("/regionssearch/radius", regionSearchRadius.byRadius)
// route for References
router.get("/references/attributes", Reference.attributes)
router.get("/references/levels/:countryCode", Reference.levelsByCountryCode)
router.get("/references/countries", Reference.countries)

module.exports = router
