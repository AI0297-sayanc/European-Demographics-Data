const express = require("express")

/** The Controller files for References */
const attributes = require("./attributes")
const countries = require("./countries")
const levels = require("./levels")

// router
const router = express.Router()

// References routes................
router.get("/attributes", attributes.attributes)
router.get("/levels/:countryCode", levels.levelsByCountryCode)
router.get("/countries", countries.countries)

module.exports = router
