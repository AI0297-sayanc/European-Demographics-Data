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
  name: "Region Hovedstaden",
  levelCode: 1,
  countryCode: "DK",
  page: 1,
  size: 10
}

test.serial("Validating Response Schema for searchidentifiersByName", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    regions: Joi.array().items(
      Joi.object({
        nutsId: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().required(),
        geoLevelName: Joi.string().required(),
        parentId: Joi.string().allow(null).required(),
        countryCode: Joi.string().required()
      })
    ).required(),
    totalData: Joi.number().required(),
    totalPages: Joi.number().required(),
    page: Joi.number().required(),
    size: Joi.number().required()
  })

  const response = await request(app)
    .get("/api/v1/searchIdentifiers/byname")
    .query(query)
    .set("Accept", "application/json")

  t.is(response.status, 200, "Status is not 200 !!!")

  const { error } = schema.validate(response.body)
  t.falsy(error, "Response does not match the schema")
})

test.serial("Check if name is valid", async (t) => {
  const response = await request(app)
    .get("/api/v1/searchIdentifiers/byname")
    .query({ ...query, name: "" })
    .set("Accept", "application/json")

  t.is(response.status, 400)
  t.true(response.body.error)
})

test.serial("Expect empty results for other levelCode", async (t) => {
  const response = await request(app)
    .get("/api/v1/searchIdentifiers/byname")
    .query({ ...query, levelCode: 999 })
    .set("Accept", "application/json")

  t.is(response.status, 200)
  t.false(response.body.error)
  t.is(response.body?.regions.length, 0)
})

test.serial("Expect empty results for other countryCode", async (t) => {
  const response = await request(app)
    .get("/api/v1/searchIdentifiers/byname")
    .query({ ...query, countryCode: "999" })
    .set("Accept", "application/json")

  t.is(response.status, 200)
  t.false(response.body.error)
  t.is(response.body?.regions.length, 0)
})

test.serial("Check if page is 1 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/searchIdentifiers/byname")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    regions: Joi.array().items(
      Joi.object({
        nutsId: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().required(),
        geoLevelName: Joi.string().required(),
        parentId: Joi.string().allow(null).required(),
        countryCode: Joi.string().required()
      })
    ).required(),
    totalData: Joi.number().required(),
    totalPages: Joi.number().required(),
    page: Joi.number().valid(1).required(),
    size: Joi.number().required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if size is 10 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/searchIdentifiers/byname")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    regions: Joi.array().items(
      Joi.object({
        nutsId: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().required(),
        geoLevelName: Joi.string().required(),
        parentId: Joi.string().allow(null).required(),
        countryCode: Joi.string().required()
      })
    ).required(),
    totalData: Joi.number().required(),
    totalPages: Joi.number().required(),
    page: Joi.number().required(),
    size: Joi.number().valid(10).required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if page is 1 and size is 10 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/searchIdentifiers/byname")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    regions: Joi.array().items(
      Joi.object({
        nutsId: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().required(),
        geoLevelName: Joi.string().required(),
        parentId: Joi.string().allow(null).required(),
        countryCode: Joi.string().required()
      })
    ).required(),
    totalData: Joi.number().required(),
    totalPages: Joi.number().required(),
    page: Joi.number().valid(1).required(),
    size: Joi.number().valid(10).required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if page is 2 and size is 0 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/searchIdentifiers/byname")
    .query({ ...query, page: 2, size: 10 })

  t.is(response.body.regions?.length, 0)
})
