const express = require("express")
const router = express.Router()

const { expressjwt } = require("express-jwt")

const checkJwt = expressjwt({ secret: process.env.SECRET, algorithms: ["HS256"] }) // the JWT auth check middleware

const test = require("./test")

router.post("/test", test.test)

// router.all("*", checkJwt) // use this auth middleware for ALL subsequent routes

module.exports = router
