var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the playlistFavorites route', () => {
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
  });
  afterEach(() => {
    database.raw('truncate table playlistFavorites cascade');
  });

  describe('POST playlistFavorites', () => {
    test('It should respond to the POST method', async () => {
      let playlist = await database('playlists').select('id').first()
        .then((firstPlaylist) => firstPlaylist)
      let favorite = await database('favorites').select('id').first()
        .then((firstFavorite) => firstFavorite)

      const res = await request(app)
        .post(`/api/v1/playlists/${playlist.id}/favorites/${favorite.id}`)


      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("Success", "We Will Rock You has been added to A Knight's Tale Soundtrack!");

      playlistFavorites = await database('playlist_favorites').select()
      expect(playlistFavorites.length).toBe(1)
      expect(playlistFavorites[0].playlist_id).toBe(playlist.id)
      expect(playlistFavorites[0].favorite_id).toBe(favorite.id)

    })
    test('It should return a 404 if playlist not found', async ()=>{
      let favorite = await database('favorites').select('id').first()
        .then((firstFavorite) => firstFavorite)

      const res = await request(app)
        .post(`/api/v1/playlists/${0}/favorites/${favorite.id}`)

      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty("error", "Unable to add favorite to playlist.");
      expect(res.body).toHaveProperty("detail", "A playlist with that id cannot be found");
    })

    test('It should return a 404 if favorite not found', async ()=>{
      let playlist = await database('playlists').select('id').first()
        .then((firstPlaylist) => firstPlaylist)

      const res = await request(app)
        .post(`/api/v1/playlists/${playlist.id}/favorites/${0}`)

      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty("error", "Unable to add favorite to playlist.");
      expect(res.body).toHaveProperty("detail", "A favorite with that id cannot be found");
    })

    test('It should return a 404 if neither favorite nor playlist found', async ()=>{

      const res = await request(app)
        .post(`/api/v1/playlists/${0}/favorites/${0}`)

      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty("error", "Unable to add favorite to playlist.");
      expect(res.body).toHaveProperty("detail", "A playlist with that id cannot be found");
    })

    test('It does not allow duplicate favorites to be added to a playlist', async () => {
      let playlist = await database('playlists').select('id').first()
        .then((firstPlaylist) => firstPlaylist)
      let favorite = await database('favorites').select('id').first()
        .then((firstFavorite) => firstFavorite)

      await database('playlist_favorites').insert({playlist_id: playlist.id, favorite_id: favorite.id})
      let allPlaylistFavorites = await database('playlist_favorites').select().then(results=>results.length)

      const res = await request(app)
        .post(`/api/v1/playlists/${playlist.id}/favorites/${favorite.id}`)

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Unable to add favorite to playlist.");
      expect(res.body).toHaveProperty("detail", "That song is already on this playlist.");

      let newPlaylistFavoritesCount = await database('playlist_favorites').select().then(results=>results.length)
      expect(newPlaylistFavoritesCount).toBe(allPlaylistFavorites)
    })

  })
});
