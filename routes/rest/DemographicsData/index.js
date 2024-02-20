const express = require("express")

/** The Controller files */
const byNutsId = require("./byNutsId")

// router
const router = express.Router()

// DemographicsData routes................
router.post("/nutsids", byNutsId.byNutsId)

module.exports = router
