const express = require("express")

/** The Controller files for References */
const searchByLongLat = require("./searchByLongLat")
const searchByNutsId = require("./searchByNutsId")

// router
const router = express.Router()

// References routes................
router.get("/point", searchByLongLat.searchByLongLat)
// router.get("/nutsid/:nutsId", )

module.exports = router
