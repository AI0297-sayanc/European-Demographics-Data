const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const References = require("./References")
const RegionSearch = require("./RegionsSearch")
const DemographicsData = require("./DemographicsData")
const ReverseLookups = require("./ReverseLookups")

// Demographic Data routes...
router.use("/demographics", DemographicsData)

// Regions Search routes....
router.use("/search", RegionSearch)

// References routes................
router.use("/references", References)

// Reverse Lookups..................
router.use("/reverseLookup", ReverseLookups)

module.exports = router
