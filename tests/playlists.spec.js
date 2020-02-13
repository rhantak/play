var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the playlists route', () => {
  describe('GET playlists', ()=>{
    beforeEach(async () => {
      await database.raw('truncate table playlists cascade');
    });

    afterEach(() => {
      database.raw('truncate table playlists cascade');
    });

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

      expect(res.body.data[0].favorites[0]).toHaveProperty("title", "We Will Rock You");
      expect(res.body.data[0].favorites[0]).toHaveProperty("artistName", "Queen");
      expect(res.body.data[0].favorites[0]).toHaveProperty("genre", "Rock");
      expect(res.body.data[0].favorites[0]).toHaveProperty("rating", 82);

      expect(res.body.data[0].favorites[1]).toHaveProperty("title", "Low Rider");
      expect(res.body.data[0].favorites[2]).toHaveProperty("title", "The Boys Are Back In Town");


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

  describe('POST playlists', () => {
    beforeEach(async () => {
      await database.raw('truncate table playlists cascade');
      fetch.resetMocks();
    });

    afterEach(() => {
      database.raw('truncate table playlists cascade');
    });

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

  describe('Delete playlist by id', () => {
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

  describe('PUT playlists', () => {
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
})
