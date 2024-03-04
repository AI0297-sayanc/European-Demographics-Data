const express = require("express")

/** The Controller files for References */
const searchByLongLat = require("./searchByLongLat")
const searchByNutsId = require("./searchByNutsId")
const searhAdjacent = require("./searchAdjacent")

// router
const router = express.Router()

// References routes................
router.get("/point", searchByLongLat.searchByLongLat)
router.get("/nutsid/:nutsId", searchByNutsId.searchByNutsId)
router.get("/adjacent/:nutsId", searhAdjacent.searchAdjacent)

module.exports = router
