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
  nutsIds: ["DK03", "DK04", "DK05", "AT06"],
  countryCode: "DK",
  levelCode: 1,
  censusAttributes: ["EU_E001", "EU_E002", "EU_E003", "EU_E004", "EU_E005"]
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    censusData: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.number().integer().required(),
        attribute: Joi.string().required(),
        description: Joi.string().required()
      })
    ).required()
  })

  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send(requestBody)

  t.is(response.status, 200)

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Checking if nutsIds is null", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: null })
  t.is(response.status, 400)
})

test.serial("Checking if nutsIds is undefined", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: undefined })
  t.is(response.status, 400)
})

test.serial("Checking if nutsIds is string", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: "DK03" })
  t.is(response.status, 400)
})

test.serial("Checking if nutsIds is empty array", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: [] })
  t.is(response.status, 400)
})