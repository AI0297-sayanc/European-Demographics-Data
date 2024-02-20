const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const Reference = require("./References")
const RegionSearchRadius = require("./RegionsSearch")
const DemographicsData = require("./DemographicsData")
// const test = require("./test")

// router.post("/test", test.test)

// Demographic Data routes...
router.use("/demographics", DemographicsData)

// Regions Search routes....
router.post("/search/radius", RegionSearchRadius.byRadius)

// DemographicsData routes................
router.use("/demographics", DemographicsData)

// route for References
router.get("/references/attributes", Reference.attributes)
router.get("/references/levels/:countryCode", Reference.levelsByCountryCode)
router.get("/references/countries", Reference.countries)

module.exports = router
