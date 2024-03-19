const express = require("express")

/** The Controller files */
const byRadius = require("./byRadius")
const byNutsId = require("./byNutsId")
const byGeoJson = require("./byGeoJson")
const byLongLat = require("./byLongLat")

// router
const router = express.Router()

// DemographicsData routes................
router.post("/radius", byRadius.byRadius)
router.post("/nutsids", byNutsId.byNutsId)
router.post("/geojson", byGeoJson.byGeojson)
router.post("/longlat", byLongLat.byLongLat)

module.exports = router
