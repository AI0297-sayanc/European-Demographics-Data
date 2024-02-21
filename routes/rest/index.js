const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const References = require("./References")
const RegionSearch = require("./RegionsSearch")
const DemographicsData = require("./DemographicsData")

// Demographic Data routes...
router.use("/demographics", DemographicsData)

// Regions Search routes....
router.use("/search", RegionSearch)

// References routes................
router.use("/references", References)

module.exports = router
