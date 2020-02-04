var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('Test the favorites route', () => {
  beforeEach(async () => {
    await database.raw('truncate table favorites cascade');
  });
  afterEach(() => {
    database.raw('truncate table favorites cascade');
  });

  describe('POST favorites', () => {
    test('It should respond to the POST method', async () => {
      let newFav = {
        title: "We will Rock You",
        artistName: 'Queen'
      }

      const res = await request(app)
      .post("/api/v1/favorites")
      .send(newFav);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "We Will Rock You");
      expect(res.body).toHaveProperty("artistName", "Queen");
      expect(res.body).toHaveProperty("genre", "Rock");
      expect(res.body).toHaveProperty("rating", 87);
    });

    test('It adds a favorite to the database', async() => {
      let newFav = {
        title: "We will Rock You",
        artistName: 'Queen'
      }

      let old_favorites = await database('favorites').select()
        .then(result => {
          return result;
        })
      expect(old_favorites.length).toBe(0)

      const res = await request(app)
      .post("/api/v1/favorites")
      .send(newFav);

      let new_favorites = await database('favorites').select()
        .then(result => {
          return result;
        })
      expect(new_favorites.length).toBe(1)
    })

    test('It sends an error message for missing parameters', async() => {
      let newFav = {
        title: "We will Rock You"
      }

      const res = await request(app)
      .post("/api/v1/favorites")
      .send(newFav);

      expect(res.statusCode).toBe(422);
      expect(res.body).toHaveProperty("error", "Expected format: { title: <string>, artistName: <string> }. You are missing a artistName property.");
    })

    test('It sends an error message for no tracks found', async() => {
      let newFav = {
        title: "We will Rock You",
        artistName: "asdf"
      }

      const res = await request(app)
      .post("/api/v1/favorites")
      .send(newFav);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Unable to create favorite.");
      expect(res.body).toHaveProperty("detail", "No tracks were found from your search.");
    })
  })
});
