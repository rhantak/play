var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the playlists route', () => {
  beforeEach(async () => {
    await database.raw('truncate table playlists cascade');
    let playlistsArray = [
      {
        "title": "Rock OUT",
      },
      {
        "title": "Keep Walking",
      }
    ]

    await database('playlists').insert(playlistsArray, ['id', 'title']);

    fetch.resetMocks();
  });
  afterEach(() => {
    database.raw('truncate table favorites cascade');
  });

  describe('PUT playlists', () => {
    test('It should respond to the PUT method', async () => {
      let rockOUT = await database('playlists').where({title: 'Rock OUT'}).select()
        .then(results => {
          return results[0]
        })
      let updatePlaylist = {
        title: "Rock IN"
      }
      // drilling down to the id level for rockOUT
      let rockOUTID = rockOUT.id

      const res = await request(app)
        .put(`/api/v1/playlists/${rockOUTID}`)
        .send(updatePlaylist);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Rock IN");
      expect(res.body).toHaveProperty("createdAt");
      expect(res.body).toHaveProperty("updatedAt");
      expect(res.body.id).toBe(rockOUT.id);

      let noRockOUT = await database('playlists').where({title: "Rock OUT"}).select()
      expect(noRockOUT.length).toBe(0)

      let findRockIN = await database('playlists').where({title: "Rock IN"}).select()
      expect(findRockIN.length).toBe(1)
    });

    test('It will only update a unique playlist title', async () => {
      let playlists_1 = await database('playlists').select()
      let rockOUT = await database('playlists')
                            .where({title: 'Rock OUT'})
                            .select()
                            .first()

      let updatedPlaylist = {
        title: "Keep Walking"
      }

      const res = await request(app)
        .put(`/api/v1/playlists/${rockOUT.id}`)
        .send(updatedPlaylist);

      let playlists = await database('playlists').select()
      // when given a title that already exists in the db it  does not do the update
      expect(playlists).toStrictEqual(playlists_1)

      expect(res.body).toHaveProperty("error", "Unable to update playlist.");
      expect(res.body).toHaveProperty("detail", "A playlist with that title already exists.");
    });

    test('It sends an error for missing parameters', async () => {
      let rockOUT = await database('playlists')
                            .where({title: 'Rock OUT'})
                            .select()
                            .first()

      let updatedPlaylist = {}

      const res = await request(app)
        .put(`/api/v1/playlists/${rockOUT.id}`)
        .send(updatedPlaylist);

      expect(res.statusCode).toBe(422);
      expect(res.body).toHaveProperty("error", "Expected format { title: <string> }. You are missing a title property.");
    });

    test('It sends an error for missing id', async () => {
      let updatedPlaylist = {
        title: "Keep Walking"
      }

      const res = await request(app)
        .put("/api/v1/playlists/0")
        .send(updatedPlaylist);
        
      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty("error", "Unable to update playlist.");
      expect(res.body).toHaveProperty("detail", "A playlist with that id cannot be found");
    })

  });
});
