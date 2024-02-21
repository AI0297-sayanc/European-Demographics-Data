const express = require("express")

/** The Controller files */
const Radius = require("./byRadius")

// router
const router = express.Router()

// Region Search routes................
router.post("/radius", Radius.byRadius)

module.exports = router
