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
    levelCode: Joi.number().required(),
    censusData: Joi.array()
      .items(
        Joi.object({
          countryCode: Joi.string().required(),
          censusAttributes: Joi.array()
            .items(
              Joi.object({
                name: Joi.string(),
                attribute: Joi.string().required(),
                value: Joi.number().required().allow(null),
                description: Joi.string(),
              })
            )
            .required(),
        })
      )
      .required(),
  })

  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send(requestBody)

  t.is(response.status, 200)

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("If nutsIds is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsIds")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: null })
  t.is(response.status, 400)
})

test.serial("If nutsIds is undefined, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: undefined })
  t.is(response.status, 400)
})

test.serial("If nutsIds is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: "" })
  t.is(response.status, 400)
})

test.serial("If nutsIds is NaN, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: NaN })
  t.is(response.status, 400)
})

test.serial("If nutsIds is 0, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: 0 })
  t.is(response.status, 400)
})

test.serial("If nutsIds is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: false })
  t.is(response.status, 400)
})

test.serial("If nutsIds is number, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: 22 })
  t.is(response.status, 400)
})

test.serial("If nutsIds is string, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: "DK03" })
  t.is(response.status, 400)
})

test.serial("If nutsIds is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsIds: { key: "DK03" } })
  t.is(response.status, 400)
})

test.serial("If countryCode is null, expecting 200", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, countryCode: null })
  t.is(response.status, 200)
})

test.serial("If countryCode is undefined, expecting 200", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, countryCode: undefined })
  t.is(response.status, 200)
})

test.serial("If countryCode is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, countryCode: "" })
  t.is(response.status, 400)
})

test.serial("If countryCode is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, countryCode: false })
  t.is(response.status, 400)
})

test.serial("If countryCode is array, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, countryCode: ["10"] })
  t.is(response.status, 400)
})

test.serial("If countryCode is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, countryCode: { key: "10" } })
  t.is(response.status, 400)
})

test.serial("If levelCode is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: null })
  t.is(response.status, 400)
})

test.serial("If levelCode is undefined, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: undefined })
  t.is(response.status, 400)
})

test.serial("If levelCode is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: "" })
  t.is(response.status, 400)
})

test.serial("If levelCode is string, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: "1" })
  t.is(response.status, 400)
})

test.serial("If levelCode is 0, expecting 200, but empty results", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: 0 })
  t.is(response.status, 200)
  t.true(Array.isArray(response.body.censusData))
  t.is(response.body.censusData.length, 0)
})

test.serial("If levelCode is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: false })
  t.is(response.status, 400)
})

test.serial("If levelCode is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: { key: "DK03" } })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsIds")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: null })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is undefined, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: undefined })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: "" })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is NaN, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: NaN })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is 0, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: 0 })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: false })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is number, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: 22 })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is string, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: "DK03" })
  t.is(response.status, 400)
})

test.serial("If censusAttributes is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/nutsids")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: { key: "DK03" } })
  t.is(response.status, 400)
})
