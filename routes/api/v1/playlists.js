var express = require('express');
var router = express.Router();
var favorites = require('./playlists/favorites');

var favorites = require('./playlists/favorites')

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../../knexfile')[environment];
const database = require('knex')(configuration);

router.get('/', (request, response) => {
  database('playlists')
    .select("playlists.id",
            "playlists.title",
            database.raw("select json_agg(favorites) from (select * from favorites)")
            // database.raw("json_agg(favorites) as favorites")
          )
    .sum({ songCount: 'favorites.id' })
    .avg({ songAvgRating: 'favorites.rating' })
    .select("playlists.created_at as createdAt",
            "playlists.updated_at as updatedAt")
    .leftJoin('playlist_favorites', 'playlists.id', 'playlist_favorites.playlist_id')
    .leftJoin('favorites', 'playlist_favorites.favorite_id', 'favorites.id')
    .groupBy('playlists.id')
    .then(result => {
      console.log(result)
      response.status(200).send({data: result})
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: "Oops, something went wrong!" });
    })
})

router.post('/', (request, response) => {
  const info = request.body;

  for (let requiredParameter of ["title"]) {
    if(!info[requiredParameter]) {
      return response
        .status(422)
        .send({ "error": `Expected format { title: <string> }. You are missing a ${requiredParameter} property.`})
    }
  }

  database('playlists').where(info).select()
    .then(repeat => {
      if(repeat.length) {
        return response.status(400).send({
          "error": "Unable to create playlist.",
          "detail": "A playlist with that title already exists."
        })
      } else {
        database('playlists')
        .insert(info, ["id", "title", "created_at as createdAt", "updated_at as updatedAt"])
        .then(playlistInfo => {
          return response.status(201).send(playlistInfo[0])
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
      return response
        .status(422)
        .send({ "error": `Expected format { title: <string> }. You are missing a ${requiredParameter} property.`})
    }
  }

// check id is in db
database('playlists')
  .where(id)
  .select()
  .then(results => {
    if(results.length > 0 && info.title){
      // check uniqueness of title
      database('playlists').where(info).select()
      .then(repeat => {
        if(repeat.length) {
          return response.status(400).send({
            "error": "Unable to update playlist.",
            "detail": "A playlist with that title already exists."
          })
        } else {
          // update db
          database('playlists')
          .where(id)
          .update(info, ["id", "title", "created_at as createdAt", "updated_at as updatedAt"])
          .then(updated => {
            return response.status(200).send(updated[0])
          })
        }
      })
    } else {
      return response.status(404).send({
        "error": "Unable to update playlist.",
        "detail": "A playlist with that id cannot be found"
      })
    }
  })
  .catch(error => {
    console.log(error)
    return response.status(500).json({ error: "Oops, something went wrong!" });
  })
})

router.delete('/:id', (request, response) => {
  database('playlists')
    .where(request.params)
    .del()
    .then(result => {
      if(result === 1){
        response.status(204).send()
      } else if (result === 0) {
        response.status(404).json({error: "No such playlist found. No deletion made."})
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: "Oops, something went wrong!" })
    })
})

router.use('/:playlist_id/favorites', function(request, response, next) {
  request.playlist_id = request.params.playlist_id;
  next()
}, favorites);

module.exports = router;
