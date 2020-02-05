var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the favorite by id route', () => {
  beforeEach(async () => {
    await database.raw('truncate table favorites cascade');
    let favorites = [{
      title: 'Hound Dog',
      artistName: 'Elvis Presley',
      genre: 'Rock',
      rating: 47
    },
    {
      title: 'Umbrella',
      artistName: 'Rihanna',
      genre: 'Pop',
      rating: 83
    },
    {
      title: 'everything i wanted',
      artistName: 'Billie Eilish',
      genre: 'Music',
      rating: 100
    }
    ];
    await database('favorites').insert(favorites, 'id');
  });
  afterEach(() => {
    database.raw('truncate table favorites cascade');
  });

  describe('GET favorite by id', () => {
    test('It should respond to the GET method', async() =>{
      let favOne = await database('favorites').select('id').first()

      const res = await request(app)
        .get(`/api/v1/favorites/${favOne.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Hound Dog");
      expect(res.body).toHaveProperty("artistName", "Elvis Presley");
      expect(res.body).toHaveProperty("genre", "Rock");
      expect(res.body).toHaveProperty("rating", 47);
    })

    test('It should return a 404 if id not in favorites table', async() => {
      let notAFav = -1

      const res = await request(app)
        .get(`/api/v1/favorites/${notAFav}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "No such favorite found");
    })

    test('It should return a 500 if other error comes up', async() => {
      let errorFav = 'abc'

      const res = await request(app)
        .get(`/api/v1/favorites/${errorFav}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    })
  })
});
