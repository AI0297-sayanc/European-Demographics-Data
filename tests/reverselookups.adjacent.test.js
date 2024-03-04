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
  nutsId: "DK01"
}

test.serial("Validating Response Schema for adjacent", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    regions: Joi.array().items(
      Joi.object({
        nutsId: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().integer().required(),
        geoLevelName: Joi.string().required(),
        parentId: Joi.string().allow(null).optional(),
        countryCode: Joi.string().required(),
      })
    ).required(),
  })

  const response = await request(app)
    .get("/api/v1/reverseLookup/adjacent")
    .query(query)
    .set("Accept", "application/json")
  t.is(response.status, 200, "Status is not 200 !!!")

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if nutsId is valid", async (t) => {
  const invalidLongResponse = await request(app)
    .get("/api/v1/reverseLookup/adjacent")
    .query({ nutsId: 999 })
    .set("Accept", "application/json")

  t.is(invalidLongResponse.status, 400)
  t.true(invalidLongResponse.body.error)
  t.is(invalidLongResponse.body.message, "Field 'nutsId' not valid !!!")
})
