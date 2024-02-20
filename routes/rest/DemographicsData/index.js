const express = require("express")

/** The Controller files */
const byRadius = require("./byRadius")
const byNutsId = require("./byNutsId")

// router
const router = express.Router()

// DemographicsData routes................
router.post("/radius", byRadius.byRadius)
router.post("/nutsids", byNutsId.byNutsId)

module.exports = router
