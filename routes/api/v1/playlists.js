var express = require('express');
var router = express.Router();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../../knexfile')[environment];
const database = require('knex')(configuration);
router.get('/', (request, response) => {
  database('playlists')
    .select("id", "title", "created_at as createdAt", "updated_at as updatedAt")
    .then(result => {
      response.status(200).send({data: result})
    })
    .catch(error => {
      response.status(500).json({ error: "Oops, something went wrong!" });
    })
})

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

router.put('/:id', (request, response) => {
  const info = request.body;
  const id = request.params;
// check parameters of body
  for (let requiredParameter of ["title"]) {
    if(!info[requiredParameter]) {
      response
        .status(422)
        .send({ "error": `Expected format { title: <string> }. You are missing a ${requiredParameter} property.`})
    }
  }

// check id is in db
database('playlists')
  .where({id: id.id})
  .select()
  .then(results => {
    if(results.length > 0){
      return true
    } else {
      return response.status(404).send({
        "error": "Unable to update playlist.",
        "detail": "A playlist with that id cannot be found"
      })
    }
  })
  .catch(error => {
    response.status(500).json({ error: "Oops, something went wrong!" });
  })


// check uniqueness of title
  database('playlists').where(info).select()
    .then(repeat => {
      if(repeat.length) {
        response.status(400).send({
          "error": "Unable to update playlist.",
          "detail": "A playlist with that title already exists."
        })
      } else {
        // update db
        database('playlists')
          .where(id)
          .update(info, ["id", "title", "created_at as createdAt", "updated_at as updatedAt"])
          .then(updated => {
            response.status(200).send(updated[0])
          })
        }
      })
    .catch(error => {
      response.status(500).json({ error: "Oops, something went wrong!" });
    })
})

module.exports = router;
