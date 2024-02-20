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

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    count: Joi.number().integer().min(0).required(),
    regions: Joi.array().items(
      Joi.object({
        nutsId: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().required(),
        geoLevelName: Joi.string().required(),
        parentId: Joi.string().allow(null).required(),
        countryCode: Joi.string().required()
      })
    ).required()
  })

  const requestBody = {
    nutsId: "DK03",
    radius: 10,
    levelCodes: [1, 2]
  }

  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send(requestBody)

  t.is(response.status, 200, `Expected 200 OK, but got ${response.status}`)

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})
