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
  geojson: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 1],
              [2, 2],
              [0, 0],
            ],
          ],
        },
      },
    ],
  },
  censusAttributes: ["EU_E001", "EU_E002", "EU_E003", "EU_E004", "EU_E005"],
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    censusData: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          value: Joi.number().required(),
          attribute: Joi.string().required(),
          description: Joi.string().required(),
        })
      )
      .required(),
  })

  const response = await request(app)
    .post("/api/v1/demographics/geojson")
    .set("Accept", "application/json")
    .send(requestBody)

  t.is(response.status, 200, `Expected 200 OK, but got ${response.status}`)

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("If countryCode is null, expecting 200", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/geojson")
    .set("Accept", "application/json")
    .send({ ...requestBody, countryCode: null })
  t.is(response.status, 200)
})

test.serial("If levelCode is null, expecting 200", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/geojson")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCode: undefined })
  t.is(response.status, 200)
})

test.serial("If censusAttributes is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/geojson")
    .set("Accept", "application/json")
    .send({ ...requestBody, censusAttributes: null })
  t.is(response.status, 400)
})

test.serial("Handle Missing Census Attributes", async (t) => {
  const response = await request(app)
    .post("/api/v1/demographics/geojson")
    .set("Accept", "application/json")
    .send({ geojson: requestBody.geojson })

  t.is(response.status, 400)
  t.true(response.body.error)
  t.is(
    response.body.message,
    "censusAttributes must be a valid array",
  )
})
