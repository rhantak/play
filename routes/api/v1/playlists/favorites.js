var express = require('express');
var router = express.Router();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../../../knexfile')[environment];
const database = require('knex')(configuration);
const Favorite = require("../../../../lib/models/favorite")

router.delete('/:favorite_id', (request, response) => {
  let playlistId = request.playlist_id
  let favoriteId = request.params.favorite_id

  database('playlist_favorites').where({playlist_id: playlistId, favorite_id: favoriteId})
    .del()
    .then(result => {
      if(result === 1){
        response.status(204).send()
      } else {
        database('playlists').where({id: playlistId}).select()
          .then((playlists) => playlists.length === 1)
          .then(playlistExists => {
            if(playlistExists){
            response.status(404).send({"error": "No such favorite found. No deletion made."})
          } else {
            response.status(404).send({"error": "No such playlist found. No deletion made."})
          }
        })}
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: "Oops, something went wrong!" })
    })
})

module.exports = router;
