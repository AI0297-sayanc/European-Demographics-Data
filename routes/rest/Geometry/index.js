const express = require("express")

/** The Controller files for Geometry */
const byNutsId = require("./byNutsId")

// router
const router = express.Router()

// Geometry routes................
router.get("/:nutsId", byNutsId.byNutsId)

module.exports = router
