const test = require("ava")
const request = require("supertest")
const Joi = require("joi")
const mongoose = require("mongoose")

const app = require("../app")

test.before(async (t) => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
})

test.after.always(async (t) => {
  await mongoose.connection.close()
})

test("GET /references/attributes/", async (t) => {
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

test("GET /references/levels/:countryCode", async (t) => {
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

test("GET /references/countries", async (t) => {
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
