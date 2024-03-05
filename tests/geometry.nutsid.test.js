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

const nutsId = {
  1: "DK01",
  2: "999",
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    nutsId: Joi.string().required(),
    name: Joi.string().required(),
    levelCode: Joi.number().integer().required(),
    geoLevelName: Joi.string().required(),
    parentId: Joi.string().allow(null).required(),
    countryCode: Joi.string().required(),
    centroid: Joi.object({
      type: Joi.string().valid("Point").required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    geometry: Joi.object({
      type: Joi.alternatives().try(
        Joi.string().valid("Polygon"),
        Joi.string().valid("MultiPolygon")
      ).required(),
      coordinates: Joi.alternatives().try(
        Joi.array().items(
          Joi.array().items(
            Joi.array().length(2).items().ordered(
              Joi.number().min(-180).max(180),
              Joi.number().min(-90).max(90)
            )
          )
        ),
        Joi.array().items(
          Joi.array().items(
            Joi.array().items(
              Joi.array().length(2).items().ordered(
                Joi.number().min(-180).max(180),
                Joi.number().min(-90).max(90)
              )
            )
          )
        )
      ).required()
    }).required()
  })

  const response = await request(app).get(`/api/v1/geometry/${nutsId[1]}`).set("Accept", "application/json")
  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("Check if nutsId is valid", async (t) => {
  const response = await request(app)
    .get(`/api/v1/geometry/${nutsId[2]}`)
    .set("Accept", "application/json")
  t.is(response.status, 400)
  t.true(response.body.error)
})
