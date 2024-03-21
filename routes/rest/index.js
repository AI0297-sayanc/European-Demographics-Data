const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const References = require("./References")
const RegionSearch = require("./RegionsSearch")
const DemographicsData = require("./DemographicsData")
const Geometry = require("./Geometry")
const ReverseLookups = require("./ReverseLookups")
const SearchIdentifiers = require("./SearchIdentifiers")

router.use(authMiddleware)

// Demographic Data routes...
router.use("/demographics", DemographicsData)

// Search Identifiers...
router.use("/searchIdentifiers", SearchIdentifiers)

// Regions Search routes....
router.use("/search", RegionSearch)

// References routes................
router.use("/references", References)

// Geometry routes................
router.use("/geometry", Geometry)

// Reverse Lookups..................
router.use("/reverseLookup", ReverseLookups)

module.exports = router
