var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the favorites route', () => {

  describe('POST favorites', () => {
    beforeEach(async () => {
      await database.raw('truncate table favorites cascade');
      fetch.resetMocks();
    });
    afterEach(() => {
      database.raw('truncate table favorites cascade');
    });

    test('It should respond to the POST method', async () => {
      let newFav = {
        title: "We will Rock You",
        artistName: 'Queen'
      }
      // set a mock object and stub the fetch call to return a custom object
      // so your fetch call always returns exactly what you want it to return
      await fetch.mockResponseOnce(
        JSON.stringify({
          message: {
            body: {
              track_list: [
                {
                  track: {
                    artist_name: "Queen",
                    track_name: "We Will Rock You",
                    track_rating: 87,
                    primary_genres: {
                      music_genre_list: [{
                        music_genre: {
                          music_genre_name: "Rock"
                        }
                      }]
                    }
                  }
                }
              ]
            }
          }
        })
      );

      const res = await request(app)
        .post("/api/v1/favorites")
        .send(newFav);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "We Will Rock You");
      expect(res.body).toHaveProperty("artistName", "Queen");
      expect(res.body).toHaveProperty("genre", "Rock");
      expect(res.body).toHaveProperty("rating", 87);
    });

    test('It adds a favorite to the database', async() => {
      let newFav = {
        title: "We will Rock You",
        artistName: 'Queen'
      }

      let old_favorites = await database('favorites').select()
        .then(result => {
          return result;
        })
      expect(old_favorites.length).toBe(0)

      // set a mock object and stub the fetch call to return a custom object
      // so your fetch call always returns exactly what you want it to return
      await fetch.mockResponseOnce(
        JSON.stringify({
          message: {
            body: {
              track_list: [
                {
                  track: {
                    artist_name: "Queen",
                    track_name: "We Will Rock You",
                    track_rating: 87,
                    primary_genres: {
                      music_genre_list: [{
                        music_genre: {
                          music_genre_name: "Awesome Rock"
                        }
                      }]
                    }
                  }
                }
              ]
            }
          }
        })
      );
      const res = await request(app)
        .post("/api/v1/favorites")
        .send(newFav);

      let new_favorites = await database('favorites').select()
        .then(result => {
          return result;
        })
      expect(new_favorites.length).toBe(1)
      expect(new_favorites[0].genre).toBe("Awesome Rock")
    })

    test('It sends an error message for missing parameters', async() => {
      let newFav = {
        title: "We will Rock You"
      }

      const res = await request(app)
        .post("/api/v1/favorites")
        .send(newFav);

      expect(res.statusCode).toBe(422);
      expect(res.body).toHaveProperty("error", "Expected format: { title: <string>, artistName: <string> }. You are missing a artistName property.");
    })

    test('It sends an error message for no tracks found', async() => {
      let newFav = {
        title: "We will Rock You",
        artistName: "asdf"
      }

      await fetch.mockResponseOnce(
        JSON.stringify(
          {
            message: {
                header: {
                    status_code: 200,
                    execute_time: 0.014652013778687,
                    available: 0
                },
                body: {
                    track_list: []
                }
            }
          }
        )
      )

      const res = await request(app)
        .post("/api/v1/favorites")
        .send(newFav);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Unable to create favorite.");
      expect(res.body).toHaveProperty("detail", "No tracks were found from your search.");
    })

    test('It changes blank genre to unknown', async() =>{
      let newFav = {
        title: "Superman (radio remix)",
        artistName: "LINKIN PARK"
      }

      await fetch.mockResponseOnce(
        JSON.stringify({
          message: {
            body: {
              track_list: [{
                track: {
                  track_name: "Superman (radio remix)",
                  artist_name: "LINKIN PARK",
                  track_rating: 1,
                  primary_genres: {
                    music_genre_list: []
                  }
                }
              }]
            }
          }
        })
      )

      const res = await request(app)
        .post("/api/v1/favorites")
        .send(newFav);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "Superman (radio remix)");
      expect(res.body).toHaveProperty("artistName", "LINKIN PARK");
      expect(res.body).toHaveProperty("genre", "Unknown");
      expect(res.body).toHaveProperty("rating", 1);

    })

    test('It changes a blank rating to null', async() => {
      let newFav = {
        title: "Superman (radio remix)",
        artistName: "LINKIN PARK"
      }

      await fetch.mockResponseOnce(
        JSON.stringify({
          message: {
            body: {
              track_list: [{
                track: {
                  track_name: "Superman (radio remix)",
                  artist_name: "LINKIN PARK",
                  primary_genres: {
                    music_genre_list: []
                  }
                }
              }]
            }
          }
        })
      )

      const res = await request(app)
        .post("/api/v1/favorites")
        .send(newFav);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("title", "Superman (radio remix)");
      expect(res.body).toHaveProperty("artistName", "LINKIN PARK");
      expect(res.body).toHaveProperty("genre", "Unknown");
      expect(res.body).toHaveProperty("rating", null);

    })

    test('It will not add duplicate favorites', async() => {
      let newFav = {
        title: "We will Rock You",
        artistName: 'Queen'
      }
      // set a mock object and stub the fetch call to return a custom object
      // so your fetch call always returns exactly what you want it to return
      await fetch.mockResponse(
        JSON.stringify({
          message: {
            body: {
              track_list: [
                {
                  track: {
                    artist_name: "Queen",
                    track_name: "We Will Rock You",
                    track_rating: 87,
                    primary_genres: {
                      music_genre_list: [{
                        music_genre: {
                          music_genre_name: "Rock"
                        }
                      }]
                    }
                  }
                }
              ]
            }
          }
        })
      );

      const res_1 = await request(app)
        .post("/api/v1/favorites")
        .send(newFav);

      const res_2 = await request(app)
        .post("/api/v1/favorites")
        .send(newFav);

      let db_favorites = await database('favorites').select()
        .then(result => {
          return result;
        })
      expect(db_favorites.length).toBe(1)
      expect(db_favorites[0].genre).toBe("Rock")

      expect(res_1.status).toBe(201)
      expect(res_2.status).toBe(409)
      expect(res_2.body).toHaveProperty("error", "Unable to create favorite.")
      expect(res_2.body).toHaveProperty("detail", "That song is already favorited.")
    })
  })

  describe('GET favorite by id', () => {
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

  describe('DELETE favorite by id', () => {
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
      }];
      await database('favorites').insert(favorites, 'id');
    });
    afterEach(() => {
      database.raw('truncate table favorites cascade');
    });

    test('It should respond to the DELETE method', async() =>{
      let favsCount = await database('favorites').select('id').then((favs) => favs.length)
      let favOne = await database('favorites').select('id').first()

      const res = await request(app)
        .delete(`/api/v1/favorites/${favOne.id}`);

      expect(res.statusCode).toBe(204);

      let newFavsCount = await database('favorites').select('id').then((favs) => favs.length)
      expect(newFavsCount).toBe(favsCount - 1)

      let favNotFound = await database('favorites').where(favOne).select()
      expect(favNotFound.length).toBe(0)
    })

    test('It should return a 404 if id not in favorites table', async() => {
      let notAFavID = -1

      const res = await request(app)
        .delete(`/api/v1/favorites/${notAFavID}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "No such favorite found. No deletion made.");
    })

    test('It should return a 500 if other error comes up', async() => {
      let errorFav = 'abc'

      const res = await request(app)
        .delete(`/api/v1/favorites/${errorFav}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    })
  })

  describe('GET favorites', () => {
    beforeEach(async () => {
      await database.raw('truncate table favorites cascade');
    });

    afterEach(() => {
      database.raw('truncate table favorites cascade');
    });

    test('It should respond with a list of favorites', async() => {
      let favorites_array = [
        {
          "title": "We Will Rock You",
          "artistName": "Queen",
          "genre": "Rock",
          "rating": 88
        },
        {
          "title": "Careless Whisper",
          "artistName": "George Michael",
          "genre": "Pop",
          "rating": 93
        }
      ]

      await database('favorites').insert(favorites_array, 'id');

      const res = await request(app)
        .get("/api/v1/favorites")

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);

      expect(res.body.data[0].title).toBe("We Will Rock You");
      expect(res.body.data[0].artistName).toBe("Queen");
      expect(res.body.data[0].genre).toBe("Rock");
      expect(res.body.data[0].rating).toBe(88);

      expect(res.body.data[1].title).toBe("Careless Whisper");
      expect(res.body.data[1].artistName).toBe("George Michael");
      expect(res.body.data[1].genre).toBe("Pop");
      expect(res.body.data[1].rating).toBe(93);
    });

    test("It should respond with an empty array when no favorites present", async() => {
      const res = await request(app)
        .get("/api/v1/favorites")

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data", []);
    });
  });
});
