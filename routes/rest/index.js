const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../../middlewares")

const test = require("./test")

router.post("/test", authMiddleware, test.test)

module.exports = router
