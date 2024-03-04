const test = require("ava")
const request = require("supertest")
const Joi = require("joi")

const app = require("../app")

const {
  setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("./_utils")

test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)

const nutsId = "DK01"
const levelcode = 1

const invalidNutsId = "999"

test.serial("Validating Response Schema for adjacent", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    regions: Joi.array().items(Joi.object({
      nutsId: Joi.string().required(),
      name: Joi.string().required(),
      countryCode: Joi.string().required(),
      levelCode: Joi.number().integer().required(),
      parentId: Joi.string().allow(null).required(),
      geoLevelName: Joi.string().required()
    })).required()
  })

  const response = await request(app)
    .get(`/api/v1/reverseLookup/adjacent/${nutsId}`)
    .query({ levelcode })
    .set("Accept", "application/json")

  t.is(response.status, 200, "Status is not 200 !!!")
  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if nutsId is valid", async (t) => {
  const response = await request(app)
    .get(`/api/v1/reverseLookup/adjacent/${invalidNutsId}`)
    .set("Accept", "application/json")
  t.is(response.status, 400)
  t.true(response.body.error)
})
