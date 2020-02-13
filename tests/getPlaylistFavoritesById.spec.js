var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('Test the playlistFavorites by ID route', () => {
  beforeEach( async () => {
    await database.raw('truncate table playlist_favorites cascade')
    await database.raw('truncate table playlists cascade')
    await database.raw('truncate table favorites cascade')

    let playlist = {
      title: "A Knight's Tale Soundtrack"
    }

    await database('playlists').insert(playlist, 'id');

    let favorites = [{
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

    await database('favorites').insert(favorites, 'id');

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
    }];

    await database('playlist_favorites').insert(playlistFaves, 'id');
  });

  describe('GET favorites belonging to playlist id', () => {
    test('It should respond to the GET method', async() => {
      let playlistId = await database('playlists').select('id').first()
        .then((playlistOne) => playlistOne.id)

      const res = await request(app)
        .get(`/api/v1/playlists/${playlistId}/favorites`)

      expect(res.statusCode).toBe(200);

      let playlistFaves = res.body.favorites

      expect(playlistFaves.length).toBe(3)
      expect(res.body).toHaveProperty("id", playlistId)
      expect(res.body).toHaveProperty("title", "A Knight's Tale Soundtrack")
      expect(res.body).toHaveProperty("songCount", 3)
      expect(res.body).toHaveProperty("songAvgRating", 81)
    });

    test('It should send a 404 for playlist not found', async() => {
      const res = await request(app)
        .get(`/api/v1/playlists/0/favorites`)

      expect(res.statusCode).toBe(404);

      expect(res.body).toHaveProperty("error", "No playlist found with that id.")
    })
  });
});
