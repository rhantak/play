var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the playlists route', () => {
  beforeEach(async () => {
    await database.raw('truncate table playlists cascade');
    fetch.resetMocks();
  });
  afterEach(() => {
    database.raw('truncate table playlists cascade');
  });

  describe('POST playlists', () => {
    test('It should respond to the POST method', async () => {
      let newPlaylist = {
        title: "A Knight's Tale Soundtrack"
      }

      const res = await request(app)
        .post("/api/v1/playlists")
        .send(newPlaylist);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "A Knight's Tale Soundtrack");
      expect(res.body).toHaveProperty("createdAt");
      expect(res.body).toHaveProperty("updatedAt");

      playlist = await database('playlists').where({title: "A Knight's Tale Soundtrack"}).select()
      expect(playlist.length).toBe(1)
    });

    test('It validates uniqueness of playlist title', async () => {
      let newPlaylist = {
        title: "A Knight's Tale Soundtrack"
      }

      const res_1 = await request(app)
        .post("/api/v1/playlists")
        .send(newPlaylist);

      const res_2 = await request(app)
        .post("/api/v1/playlists")
        .send(newPlaylist);

    expect(res_2.statusCode).toBe(400);
    expect(res_2.body).toHaveProperty("error", "Unable to create playlist.");
    expect(res_2.body).toHaveProperty("detail", "A playlist with that title already exists.");
    });

    test('It sends an error for missing parameters', async () => {
      let newPlaylist = {}

      const res = await request(app)
        .post("/api/v1/playlists")
        .send(newPlaylist);

      expect(res.statusCode).toBe(422);
      expect(res.body).toHaveProperty("error", "Expected format { title: <string> }. You are missing a title property.");
    });
  });
});
