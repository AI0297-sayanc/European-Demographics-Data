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
  countryCode: "DK"
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
        parentId: Joi.string().allow(null).required(), // Allow null for parentId
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