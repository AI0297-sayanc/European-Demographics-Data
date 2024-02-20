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

test.serial("GET /references/levels/:countryCode", async (t) => {
  const countryCode = "AT"
  const schema = Joi.object({
    error: Joi.boolean().required(),
    levels: Joi.array().items(
      Joi.object({
        _id: Joi.string().required(),
        levelCode: Joi.number().integer().required(),
        levelName: Joi.string().required(),
        countryCode: Joi.string().required(),
        countryName: Joi.string().required()
      })
    ).required()
  })

  const response = await request(app).get(`/api/v1/references/levels/${countryCode}`).set("Accept", "application/json")

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})