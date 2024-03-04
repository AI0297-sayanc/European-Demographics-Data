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
  nutsId: "DK159"
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    nutsId: Joi.string().required(),
    name: Joi.string().required(),
    levelCode: Joi.number().integer().required(),
    geoLevelName: Joi.string().required(),
    parentId: Joi.string().required(),
    countryCode: Joi.string().required(),
    centroid: Joi.object({
      type: Joi.string().valid("point").required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    geometry: Joi.object({
      type: Joi.alternatives().try(Joi.string().valid("polygon"), Joi.string().valid("multipolygon")).required(),
      coordinates: Joi.array().items(
        Joi.array().items(
          Joi.array().items(Joi.number()).length(2)
        )
      ).required()
    }).required()
  })
  const response = await request(app).get("/api/v1/geometry").set("Accept", "application/json")

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if nutsId is valid", async (t) => {
  const invalidLongResponse = await request(app)
    .get("/api/v1/geometry")
    .query({ nutsId: 999 })
    .set("Accept", "application/json")

  t.is(invalidLongResponse.status, 400)
  t.true(invalidLongResponse.body.error)
  t.is(invalidLongResponse.body.message, "Field 'nutsId' not valid !!!")
})

test.serial("Comparing valid and invalid coordinates", async (t) => {
  const validCoordinates = [12.470167490157134, 55.747539659747865]
  const invalidCoordinates = [200, 1000]

  const responseValid = await request(app)
    .get("/api/v1/geometry")
    .query({ ...query, coordinates: validCoordinates })
    .set("Accept", "application/json")

  const responseInvalid = await request(app)
    .get("/api/v1/geometry")
    .query({ ...query, coordinates: invalidCoordinates })
    .set("Accept", "application/json")

  t.is(responseValid.status, 200)

  t.is(responseInvalid.status, 400)
})

test.serial("Checking if coordinates fall out of range", async (t) => {
  const coordinatesOutsideRange = [200, 1000]

  const response = await request(app)
    .get("/api/v1/geometry")
    .query({ ...query, coordinates: coordinatesOutsideRange })
    .set("Accept", "application/json")

  t.is(response.status, 400)
})
