var express = require('express');
var router = express.Router();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../../knexfile')[environment];
const database = require('knex')(configuration);


router.post('/', (request, response) => {
  const info = request.body;

  for (let requiredParameter of ["title"]) {
    if(!info[requiredParameter]) {
      response
        .status(422)
        .send({ "error": `Expected format { title: <string> }. You are missing a ${requiredParameter} property.`})
    }
  }

  database('playlists').where(info).select()
    .then(repeat => {
      if(repeat.length) {
        response.status(400).send({
          "error": "Unable to create playlist.",
          "detail": "A playlist with that title already exists."
        })
      } else {
        database('playlists')
        .insert(info, ["id", "title", "created_at as createdAt", "updated_at as updatedAt"])
        .then(playlistInfo => {
          response.status(201).send(playlistInfo[0])
        })
      }
    })
    .catch(500)
})

module.exports = router;
