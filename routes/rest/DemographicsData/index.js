const express = require("express")

/** The Controller files */
const byRadius = require("./byRadius")
const byNutsId = require("./byNutsId")
const byGeoJson = require("./byGeoJson")
const byLongLat = require("./byLongLat")
const byAdjacent = require("./byAdjacent")

// router
const router = express.Router()

// DemographicsData routes................
router.post("/radius", byRadius.byRadius)
router.post("/nutsids", byNutsId.byNutsId)
router.post("/longlat", byLongLat.byLongLat)
router.post("/geojson", byGeoJson.byGeoJson)
router.post("/adjacent", byAdjacent.byAdjacent)

module.exports = router
