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

      let favoritesArray = [{
        title: 'We Will Rock You',
        artistName: 'Queen',
        genre: 'Rock',
        rating: 82
      },
      {
        title: 'Low Rider',
        artistName: 'War',
        genre: 'Funk',
        rating: 72
      },
      {
        title: 'The Boys Are Back In Town',
        artistName: 'Thin Lizzy',
        genre: 'Rock',
        rating: 90
      }];

      await database('favorites').insert(favoritesArray, ['id', 'title']);

      let faveIds = await database('favorites').pluck('id')

      let playlistId = await database('playlists').select('id').first()
      .then((firstPlaylist) => firstPlaylist.id)

      let playlistFaves = [{
        playlist_id: playlistId, favorite_id: faveIds[0]
      },
      {
        playlist_id: playlistId, favorite_id: faveIds[1]
      },
      {
        playlist_id: playlistId, favorite_id: faveIds[2]
      }]
      let inserted = await database('playlist_favorites').insert(playlistFaves, 'id').then((result)=>result);
      console.log(inserted)
      
      const res = await request(app)
        .get("/api/v1/playlists")

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);

      expect(res.body.data[0]).toHaveProperty("title", "Rock OUT");
      expect(res.body.data[0]).toHaveProperty("id");
      expect(res.body.data[0]).toHaveProperty("createdAt");
      expect(res.body.data[0]).toHaveProperty("updatedAt");
      expect(res.body.data[0]).toHaveProperty("songCount");
      expect(res.body.data[0]).toHaveProperty("songAvgRating");
      expect(res.body.data[0]).toHaveProperty("favorites");

      expect(res.body.data[1]).toHaveProperty("title", "Keep Walking");
      expect(res.body.data[1]).toHaveProperty("id");
      expect(res.body.data[1]).toHaveProperty("createdAt");
      expect(res.body.data[1]).toHaveProperty("updatedAt");
      expect(res.body.data[1]).toHaveProperty("songCount");
      expect(res.body.data[1]).toHaveProperty("songAvgRating");
      expect(res.body.data[1]).toHaveProperty("favorites");

    });

    test("It should respond with an empty array when no playlists present", async() => {

      const res = await request(app)
        .get("/api/v1/playlists")

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data", []);
    });
  })
});
