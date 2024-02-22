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
  page: 1,
  size: 10
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    countries: Joi.array().items(
      Joi.object({
        countryCode: Joi.string().required(),
        countryName: Joi.string().required()
      })
    ).required(),
    totalData: Joi.number().integer().required(),
    totalPages: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    size: Joi.number().integer().required()
  })

  const response = await request(app).get("/api/v1/references/countries").set("Accept", "application/json")

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if page is 1 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/countries")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    countries: Joi.array().items(
      Joi.object({
        countryCode: Joi.string().required(),
        countryName: Joi.string().required()
      })
    ).required(),
    totalData: Joi.number().integer().required(),
    totalPages: Joi.number().integer().required(),
    page: Joi.number().integer().valid(1).required(),
    size: Joi.number().integer().required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if size is 10 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/countries")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    countries: Joi.array().items(
      Joi.object({
        countryCode: Joi.string().required(),
        countryName: Joi.string().required()
      })
    ).required(),
    totalData: Joi.number().integer().required(),
    totalPages: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    size: Joi.number().integer().valid(10).required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if page is 1 and size is 10 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/countries")
    .query(query)

  const schema = Joi.object({
    error: Joi.boolean().required(),
    countries: Joi.array().items(
      Joi.object({
        countryCode: Joi.string().required(),
        countryName: Joi.string().required()
      })
    ).required(),
    totalData: Joi.number().integer().required(),
    totalPages: Joi.number().integer().required(),
    page: Joi.number().integer().valid(1).required(),
    size: Joi.number().integer().valid(10).required()
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if page is 2 and size is 0 in all output data", async (t) => {
  const response = await request(app)
    .get("/api/v1/references/countries")
    .query({ page: 2, size: 10 })

  const schema = Joi.object({
    error: Joi.boolean().required(),
    countries: Joi.array().items().length(0),
    totalData: Joi.number().integer().valid(4).required(),
    totalPages: Joi.number().integer().valid(1).required(),
    page: Joi.number().integer().valid(2).required(),
    size: Joi.number().integer().valid(10).required(),
  })

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})
