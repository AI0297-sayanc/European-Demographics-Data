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
  name: "Population",
  levelCode: 1,
  countryCode: "AT",
  page: 1,
  size: 10
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    attributes: Joi.array().items(
      Joi.object({
        attribute: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().integer().required(),
        countryCode: Joi.string().required(),
        date: Joi.any().allow(null).optional(),
        source: Joi.any().allow(null).optional(),
        sourceName: Joi.any().allow(null).optional(),
        description: Joi.string().required(),
        currencyCode: Joi.any().allow(null).optional()
      })
    ).required(),
    totalData: Joi.number().integer().required(),
    totalPages: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    size: Joi.number().integer().required()
  })
  const response = await request(app).get("/api/v1/references/attributes/").set("Accept", "application/json")

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if name is 'Population' in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/attributes")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    attributes: Joi.array().items(
      Joi.object({
        attribute: Joi.string().required(),
        name: Joi.string().valid("Population").required(),
        levelCode: Joi.number().integer().required(),
        countryCode: Joi.string().required(),
        date: Joi.any().allow(null).optional(),
        source: Joi.any().allow(null).optional(),
        sourceName: Joi.any().allow(null).optional(),
        description: Joi.string().required(),
        currencyCode: Joi.any().allow(null).optional()
      })
    ).required(),
    totalData: Joi.number().integer().required(),
    totalPages: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    size: Joi.number().integer().required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if levelCode is 1 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/attributes")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    attributes: Joi.array().items(
      Joi.object({
        attribute: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().integer().valid(1).required(),
        countryCode: Joi.string().required(),
        date: Joi.any().allow(null).optional(),
        source: Joi.any().allow(null).optional(),
        sourceName: Joi.any().allow(null).optional(),
        description: Joi.string().required(),
        currencyCode: Joi.any().allow(null).optional()
      })
    ).required(),
    totalData: Joi.number().integer().required(),
    totalPages: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    size: Joi.number().integer().required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if countryCode is AT in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/attributes")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    attributes: Joi.array().items(
      Joi.object({
        attribute: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().integer().required(),
        countryCode: Joi.string().valid("AT").required(),
        date: Joi.any().allow(null).optional(),
        source: Joi.any().allow(null).optional(),
        sourceName: Joi.any().allow(null).optional(),
        description: Joi.string().required(),
        currencyCode: Joi.any().allow(null).optional()
      })
    ).required(),
    totalData: Joi.number().integer().required(),
    totalPages: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    size: Joi.number().integer().required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if page is 1 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/attributes")
    .query({ ...query, page: 1 })

  t.is(response.body.page, 1)
})

test.serial("Check if size is 10 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/attributes")
    .query({ ...query, size: 10 })

  t.is(response.body.size, 10)
})

test.serial("Check if page is 1 and size is 10 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/attributes")
    .query({ ...query, page: 1, size: 10 })

  t.is(response.body.page, 1)
  t.is(response.body.size, 10)
})

test.serial("Check if page is 2 and size is 0 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/attributes")
    .query({ ...query, page: 2, size: 10 })

  t.is(response.body.attributes?.length, 0)
})
