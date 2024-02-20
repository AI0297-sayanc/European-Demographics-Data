const express = require("express")

/** The Controller files */
const byRadius = require("./byRadius")

// router
const router = express.Router()

// DemographicsData routes................
router.post("/radius", byRadius.byRadius)

module.exports = router
