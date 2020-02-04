var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

describe('Test the favorites route', () => {
  // before each and after all database table setup
  test('It should respond to the POST method', async () => {
    let newFav = {
      title: "We will Rock You",
      artistName: 'Queen'
    }

    const res = await request(app)
      .post("/api/v1/favorites")
        .send(newFav);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", "We Will Rock You");
    expect(res.body).toHaveProperty("artistName", "Queen");
    expect(res.body).toHaveProperty("genre", "Rock");
    expect(res.body).toHaveProperty("rating", 87);
  });
  // Test favorite gets added to the database
  // Test sad paths
});
