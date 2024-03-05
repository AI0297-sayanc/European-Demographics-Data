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
  nutsId: "DK03",
  radius: 10,
  levelCodes: [1, 2]
}

test.serial("Validating Response Schema", async (t) => {
  const schema = Joi.object({
    error: Joi.boolean().required(),
    count: Joi.number().integer().min(0).required(),
    regions: Joi.array().items(
      Joi.object({
        nutsId: Joi.string().required(),
        name: Joi.string().required(),
        levelCode: Joi.number().required(),
        geoLevelName: Joi.string().required(),
        parentId: Joi.string().allow(null).required(),
        countryCode: Joi.string().required()
      })
    ).required()
  })

  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send(requestBody)

  t.is(response.status, 200)

  const { error } = schema.validate(response.body, { abortEarly: false })
  t.is(error === undefined, true, error?.message)
})

test.serial("If nutsId is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: null })
  t.is(response.status, 400)
})

test.serial("If nutsId is undefined, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: undefined })
  t.is(response.status, 400)
})

test.serial("If nutsId is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: "" })
  t.is(response.status, 400)
})

test.serial("If nutsId is NaN, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: NaN })
  t.is(response.status, 400)
})

test.serial("If nutsId is 0, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: 0 })
  t.is(response.status, 400)
})

test.serial("If nutsId is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: false })
  t.is(response.status, 400)
})

test.serial("If nutsId is number, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: 22 })
  t.is(response.status, 400)
})

test.serial("If nutsId is array, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: ["DK03"] })
  t.is(response.status, 400)
})

test.serial("If nutsId is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, nutsId: { key: "DK03" } })
  t.is(response.status, 400)
})

test.serial("If radius is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, radius: null })
  t.is(response.status, 400)
})

test.serial("If radius is undefined, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, radius: undefined })
  t.is(response.status, 400)
})

test.serial("If radius is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, radius: "" })
  t.is(response.status, 400)
})

test.serial("If radius is NaN, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, radius: NaN })
  t.is(response.status, 400)
})

test.serial("If radius is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, radius: false })
  t.is(response.status, 400)
})

test.serial("If radius is array, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, radius: ["10"] })
  t.is(response.status, 400)
})

test.serial("If radius is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, radius: { key: "10" } })
  t.is(response.status, 400)
})

test.serial("If levelCodes is null, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCodes: null })
  t.is(response.status, 400)
})

test.serial("If levelCodes is undefined, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCodes: undefined })
  t.is(response.status, 400)
})

test.serial("If levelCodes is empty, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCodes: "" })
  t.is(response.status, 400)
})

test.serial("If levelCodes is NaN, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCodes: NaN })
  t.is(response.status, 400)
})

test.serial("If levelCodes is 0, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCodes: 0 })
  t.is(response.status, 400)
})

test.serial("If levelCodes is false, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCodes: false })
  t.is(response.status, 400)
})

test.serial("If levelCodes is number, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCodes: 22 })
  t.is(response.status, 400)
})

test.serial("If levelCodes is object, expecting 400", async (t) => {
  const response = await request(app)
    .post("/api/v1/search/radius")
    .set("Accept", "application/json")
    .send({ ...requestBody, levelCodes: { key: "DK03" } })
  t.is(response.status, 400)
})