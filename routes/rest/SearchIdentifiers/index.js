const express = require("express")

/** The Controller files for References */
const searchByName = require("./searchByName")

// router
const router = express.Router()

// References routes................
router.get("/byname", searchByName.searchByName)

module.exports = router
