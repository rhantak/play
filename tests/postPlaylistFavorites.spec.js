var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the playlistFavorites route', () => {
  beforeEach(async () => {
    await database.raw('truncate table playlistFavorites cascade');
    fetch.resetMocks();
  });
  afterEach(() => {
    database.raw('truncate table playlistFavorites cascade');
  });

  describe('POST playlistFavorites', () => {
    test('It should respond to the POST method', async () => {
      
    })
  })
});
