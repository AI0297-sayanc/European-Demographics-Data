const test = require("ava")
const request = require("supertest")
const Joi = require("joi")

const app = require("../app")

const {
  setupMongo,
  teardownMongo,
  setupFixtures,
  teardownFixtures,
} = require("./_utils")

test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)

const requestBody = {
  long: 14.825397676783044,
  lat: 55.254097633301434,
  censusAttributes: [
    "EU_E001",
    "EU_E002",
    "EU_E003",
    "EU_E004",
    "EU_E005"
  ],
  levelCode: 1,
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    levelCode: Joi.number().integer().required(),
    censusData: Joi.array()
      .items(
        Joi.object({
          countryCode: Joi.string().required(),
          censusAttributes: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required(),
                attribute: Joi.string().required(),
                value: Joi.number().allow(null).required(),
                description: Joi.string().required(),
              })
            )
            .required(),
        })
      )
      .required(),
  })

  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send(requestBody)

  t.is(response.status, 200, `Expected 200 OK, but got ${response.status}`)

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
  t.is(response.body.levelCode, requestBody.levelCode, "levelCode mismatch")
})

test.serial("If levelCode is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: null })
  t.is(response.status, 400)
})

test.serial("If levelCode is undefined, set default to 3, and expect 200", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: undefined })
  t.is(response.status, 200)
  t.is(response.body.levelCode, 3)
})

test.serial("If levelCode is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: "" })
  t.is(response.status, 400)
})

test.serial("If levelCode is string, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: "1" })
  t.is(response.status, 400)
})

test.serial(
  "If levelCode is 0, expecting 200, but empty results",
  async (t) => {
    const response = await request(app)
      .post("/api/v1/demographics/longlat")
      .set("Accept", "application/json")
      .send({ ...requestBody, levelCode: 0 })
    t.is(response.status, 400)
  }
)

test.serial("If levelCode is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: false })
  t.is(response.status, 400)
})

test.serial("If levelCode is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: { key: "DK03" } })
  t.is(response.status, 400)
})

test.serial("Check if long is valid", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .send({ ...requestBody, long: 999 })
    .set("Accept", "application/json")

  t.is(response.status, 400)
  t.true(response.body.error)
  t.is(response.body.message, "Field 'long' not valid !!!")
})

test.serial("Check if lat is valid", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .send({ ...requestBody, lat: 999 })
    .set("Accept", "application/json")

  t.is(response.status, 400)
  t.true(response.body.error)
  t.is(response.body.message, "Field 'lat' not valid !!!")
})

test.serial("If censusAttributes is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: null })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is undefined, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: undefined })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: "" })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is NaN, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: NaN })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is 0, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: 0 })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: false })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is number, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: 22 })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is string, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: "DK03" })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/longlat")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: { key: "DK03" } })
  t.is(response.status, 400)
})
