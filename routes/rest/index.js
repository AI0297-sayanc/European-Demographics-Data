const express = require("express")
const router = express.Router()


const { expressjwt } = require("express-jwt")

const checkJwt = expressjwt({ secret: process.env.SECRET, algorithms: ["HS256"] }) // the JWT auth check middleware

const test = require("./test")

router.post("/test", test.test)

module.exports = router
