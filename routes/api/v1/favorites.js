var express = require('express');
var router = express.Router();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../../knexfile')[environment];
const database = require('knex')(configuration);
const fetch = require("node-fetch");

async function fetchMusicData(info) {
  let url = `https://api.musixmatch.com/ws/1.1/track.search?q_track=${info["title"]}&q_artist=${info["artistName"]}&s_artist_rating=desc&s_track_rating=desc&page_size=1&apikey=${process.env.MM_KEY}`
  let data = await fetch(url)
    .then(response => response.json())
    .then(result => {
      return result.message.body.track_list[0].track;
    })
    return data;
}

router.post('/', (request, response) => {
  const info = request.body;

  for (let requiredParameter of ["title", "artistName"]) {
    if (!info[requiredParameter]) {
      return response
        .status(422)
        .send({ "error": `Expected format: { title: <string>, artistName: <string> }. You are missing a ${requiredParameter} property.`})
    }
  }

  let musicData = fetchMusicData(info)
    .then(data => response.send(data))
  // default no genre to unknown
  // add fetched data to favorites table
  // return success response
  // set condition for returning 400 response
  // catch 500
});

module.exports = router;
