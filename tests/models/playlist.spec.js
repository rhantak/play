var shell = require('shelljs');
var request = require("supertest");
var app = require('../../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the playlists resource', () => {
  beforeEach(async () => {
    await database.raw('truncate table favorites cascade');
  });
  afterEach(() => {
    database.raw('truncate table favorites cascade');
  });

  test('It should not allow duplicate titles', async() => {
    let playlistsArray = [
      {
        "title": "Rock OUT",
      },
      {
        "title": "Rock OUT",
      }
    ]

    await expect(database('playlists').insert(playlistsArray, ['id', 'title'])).rejects.toThrow("insert into \"playlists\" (\"title\") values ($1), ($2) returning \"id\", \"title\" - duplicate key value violates unique constraint \"playlists_title_unique\"");

  })

})
