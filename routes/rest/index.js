const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const References = require("./References")
const RegionSearchRadius = require("./RegionsSearch")
const DemographicsData = require("./DemographicsData")

// Regions Search routes....
router.post("/search/radius", RegionSearchRadius.byRadius)

// DemographicsData routes................
router.use("/demographics", DemographicsData)

// References routes................
router.use("/references", References)

module.exports = router
