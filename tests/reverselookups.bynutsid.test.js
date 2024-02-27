const test = require("ava")
const request = require("supertest")
const Joi = require("joi")

const app = require("../app")

const {
  setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("./_utils")
const regions = require("./_fixtures/regions")

const nutsId = {
  1: "DK01",
  2: "DK011",
  3: "DK101"
}

const nonExistentNutsId = "NonExistentId"

test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)

test.serial("Validating Response Schema for searchByNutsId", async (t) => {
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
    .get(`/api/v1/reverseLookup/nutsid/${nutsId[3]}`)
    .set("Accept", "application/json")
  t.is(response.status, 200, "Status is not 200 !!!")

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("If given nutsid is level 3, regions returned will be <= 2", async (t) => {
  const response = await request(app)
    .get(`/api/v1/reverseLookup/nutsid/${nutsId[3]}`)
    .set("Accept", "application/json")

  t.is(response.status, 200)
  t.is(response.body.regions.length <= 2, true)
})

test.serial("If given nutsid is level 2, regions returned will be <= 1", async (t) => {
  const response = await request(app)
    .get(`/api/v1/reverseLookup/nutsid/${nutsId[2]}`)
    .set("Accept", "application/json")

  t.is(response.status, 200)
  t.is(response.body.regions.length <= 1, true)
})

test.serial("If given nutsid is level 1, regions returned will be 0", async (t) => {
  const response = await request(app)
    .get(`/api/v1/reverseLookup/nutsid/${nutsId[1]}`)
    .set("Accept", "application/json")

  t.is(response.status, 200)
  t.is(response.body.regions.length, 0)
})

test.serial("Check if nutsId is not found", async (t) => {
  const response = await request(app)
    .get(`/api/v1/reverseLookup/nutsid/${nonExistentNutsId}`)
    .set("Accept", "application/json")

  t.is(response.status, 400)
  t.true(response.body.error)
  t.is(
    response.body.message,
    `No such nuts id ${nonExistentNutsId}`,
    "Incorrect error message for non-existent nutsId !!!"
  )
})
