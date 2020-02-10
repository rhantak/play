var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('Test the delete playlist by id route', () => {
  beforeEach(async () => {
    await database.raw('truncate table playlists cascade');
    let playlists = [{
      title: "Sweet Jams"
    },
    {
      title: "In My Feelings"
    }];
    await database('playlists').insert(playlists, 'id');
  });

  describe('Delete playlist by id', () => {
    test('It should respond to the delete method', async() => {
      let playlistCount = await database('playlists').select()
        .then((playlists) => playlists.length)

      let playlistOne = await database('playlists').select('id').first()

      const res = await request(app)
        .delete(`/api/v1/playlists/${playlistOne.id}`);

      expect(res.statusCode).toBe(204);

      let newPlaylistCount = await database('playlists').select()
        .then((playlists) => playlists.length)

      expect(newPlaylistCount).toBe(playlistCount - 1)

      playlistNotFound = await database('playlists').where(playlistOne).select()

      expect(playlistNotFound.length).toBe(0)
    })

    test('It should send a 404 if no playlist found', async() => {
      let playlistCount = await database('playlists').select()
        .then((playlists) => playlists.length)

      const res = await request(app)
        .delete('/api/v1/playlists/0');

      expect(res.statusCode).toBe(404);

      let newPlaylistCount = await database('playlists').select()
        .then((playlists) => playlists.length)

      expect(newPlaylistCount).toBe(playlistCount)
    })
  })
})
