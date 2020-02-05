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

  describe('GET favorites', () => {
    test('It should respond with a list of favorites', async() => {
      let favorites_array = [
        {
          "title": "We Will Rock You",
          "artistName": "Queen",
          "genre": "Rock",
          "rating": 88
        },
        {
          "title": "Careless Whisper",
          "artistName": "George Michael",
          "genre": "Pop",
          "rating": 93
        }
      ]

      await database('favorites').insert(favorites_array, 'id');

      const res = await request(app)
        .get("/api/v1/favorites")

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);

      expect(res.body.data[0].title).toBe("We Will Rock You");
      expect(res.body.data[0].artistName).toBe("Queen");
      expect(res.body.data[0].genre).toBe("Rock");
      expect(res.body.data[0].rating).toBe(88);

      expect(res.body.data[1].title).toBe("Careless Whisper");
      expect(res.body.data[1].artistName).toBe("George Michael");
      expect(res.body.data[1].genre).toBe("Pop");
      expect(res.body.data[1].rating).toBe(93);
    });

    test("It should respond with an empty array when no favorites present", async() => {
      const res = await request(app)
        .get("/api/v1/favorites")

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data", []);
    });
  });
});
