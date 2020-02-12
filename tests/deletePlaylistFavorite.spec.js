var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the delete playlistFavorite by ids route', () => {
  beforeEach(async () => {
    await database.raw('truncate table playlist_favorites cascade');
    await database.raw('truncate table favorites cascade');
    await database.raw('truncate table playlists cascade');

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

  describe('delete favorites from a playlist by id', () => {
    test('It should respond to the delete method', async() => {
      let playlistId = await database('playlists').select('id').first()
        .then((firstPlaylist) => firstPlaylist.id)

      let faveCount = await database('playlist_favorites').where({playlist_id: playlistId}).select()
        .then((playlistFaves) => playlistFaves.length)

      let favoriteOne = await database('favorites').select().first()

      const res = await request(app)
        .delete(`/api/v1/playlists/${playlistId}/favorites/${favoriteOne.id}`)

      expect(res.statusCode).toBe(204);

      let newFaveCount = await database('playlist_favorites').where({playlist_id: playlistId}).select()
          .then((playlistFaves) => playlistFaves.length)

      expect(newFaveCount).toBe(faveCount - 1)

      let notFound = await database('playlist_favorites').where({playlist_id: playlistId, favorite_id: favoriteOne.id}).select()
        .then((playlistFaves) => playlistFaves.length)

      expect(notFound).toBe(0)
    })

    test('It should send a 404 if it cannot find a playlist', async() => {
      let favoriteOne = await database('favorites').select().first()

      const res = await request(app)
        .delete(`/api/v1/playlists/0/favorites/${favoriteOne.id}`)

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "No such playlist found. No deletion made.");
    })

    test('It should send a 404 if it cannot find a favorite', async() => {
      let playlistId = await database('playlists').select('id').first()
        .then((firstPlaylist) => firstPlaylist.id)

      const res = await request(app)
        .delete(`/api/v1/playlists/${playlistId}/favorites/0`)

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "No such favorite found. No deletion made.");
    })
  })
});
