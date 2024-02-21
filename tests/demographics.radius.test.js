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

const requestBody = {
  nutsId: "DK03",
  radius: 50,
  countryCode: "DK",
  levelCode: 1,
  censusAttributes: [
    "EU_E001",
    "EU_E002",
    "EU_E003",
    "EU_E004",
    "EU_E005"
  ]
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    censusData: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.number().required(),
        attribute: Joi.string().required(),
        description: Joi.string().required()
      })
    ).required()
  })

  const response = await request(app)
    .post("/api/v1/demographics/radius")
    .set("Accept", "application/json")
    .send(requestBody)

  t.is(response.status, 200, `Expected 200 OK, but got ${response.status}`)

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})
