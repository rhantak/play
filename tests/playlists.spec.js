var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the playlists route', () => {
  beforeEach(async () => {
    await database.raw('truncate table playlists cascade');
  });
  afterEach(() => {
    database.raw('truncate table playlists cascade');
  });

  describe('GET playlists', ()=>{
    test('It should respond with a list of playlists', async() => {
      let playlistsArray = [
        {
          "title": "Rock OUT",
        },
        {
          "title": "Keep Walking",
        }
      ]

      await database('playlists').insert(playlistsArray, ['id', 'title']);

      const res = await request(app)
        .get("/api/v1/playlists")

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);

      expect(res.body.data[0]).toHaveProperty("title", "Rock OUT");
      expect(res.body.data[0]).toHaveProperty("id");
      expect(res.body.data[0]).toHaveProperty("createdAt");
      expect(res.body.data[0]).toHaveProperty("updatedAt");

      expect(res.body.data[1]).toHaveProperty("title", "Keep Walking");
      expect(res.body.data[1]).toHaveProperty("id");
      expect(res.body.data[1]).toHaveProperty("createdAt");
      expect(res.body.data[1]).toHaveProperty("updatedAt");

    });
  })
});
