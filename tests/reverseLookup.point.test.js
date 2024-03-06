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

const query = {
  long: 9.39561931121928,
  lat: 56.247671229173605
}

test.serial("Validating Response Schema for searchByLongLat", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    regions: Joi.array().items(
      Joi.object({
        nutsId: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().integer().required(),
        geoLevelName: Joi.string().required(),
        parentId: Joi.string().allow(null).optional(),
        countryCode: Joi.string().required(),
      })
    ).required(),
  })

  const response = await request(app)
    .get("/api/v1/reverseLookup/point")
    .query(query)
    .set("Accept", "application/json")
  t.is(response.status, 200, "Status is not 200 !!!")

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if long is valid", async (t) => {
  const response = await request(app)
    .get("/api/v1/reverseLookup/point")
    .query({ ...query, long: 999 })
    .set("Accept", "application/json")

  t.is(response.status, 400)
  t.true(response.body.error)
  t.is(response.body.message, "Field 'long' not valid !!!")
})

test.serial("Check if lat is valid", async (t) => {
  const response = await request(app)
    .get("/api/v1/reverseLookup/point")
    .query({ ...query, lat: 999 })
    .set("Accept", "application/json")

  t.is(response.status, 400)
  t.true(response.body.error)
  t.is(response.body.message, "Field 'lat' not valid !!!")
})

test.serial("Check if count is less than or equal to 3", async (t) => {
  const response = await request(app)
    .get("/api/v1/reverseLookup/point")
    .query(query)
    .set("Accept", "application/json")

  t.is(response.status, 200)
  t.is(response.body.regions.length <= 3, true)
})
