const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const Reference = require("./References")
const RegionSearch = require("./RegionsSearch")
const DemographicsData = require("./DemographicsData")

// Demographic Data routes...
router.use("/demographics", DemographicsData)

// Regions Search routes....
router.use("/search", RegionSearch)

// route for References
router.get("/references/attributes", Reference.attributes)
router.get("/references/levels/:countryCode", Reference.levelsByCountryCode)
router.get("/references/countries", Reference.countries)

module.exports = router
