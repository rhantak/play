var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


describe('Test the favorites route', () => {
  beforeEach(async () => {
    await database.raw('truncate table favorites cascade');
    fetch.resetMocks();
  });
  afterEach(() => {
    database.raw('truncate table favorites cascade');
  });

  describe('POST favorites', () => {
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
    // 
    // test('It changes a blank rating to null', aync() => {
    //
    // })
  })
});
