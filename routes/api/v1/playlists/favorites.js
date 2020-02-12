var express = require('express');
var router = express.Router();
const Favorite = require("../../../../lib/models/favorite")

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../../../knexfile')[environment];
const database = require('knex')(configuration);


router.post('/:favorite_id', (request, response) => {
  let playlistId = request.playlist_id
  let favoriteId = request.params.favorite_id

  // check playlistId is in playlist table
  // check favoriteId is in favorite table
  checkIds(playlistId, favoriteId)
    .then(data =>{
      // if both pass, then make new playlist_favorite
      if (data["playlist_id"] && data["favorite_id"]){
        var success = {
          "Success": `${data.favorite_title} has been added to ${data.playlist_title}`
        }
        database('playlist_favorites')
        .insert({
          playlist_id: data.playlist_id,
          favorite_id: data.favorite_id
        }, 'id')
        .then(result => {
          response.status(201).json(success)
        })
      } else if (data["errorStatus"] === 404){
        response.status(404).json({error: data["error"], detail: data["detail"]})
      } else if (data["errorStatus"] === 400){
        response.status(400).json({error: data["error"], detail: data["detail"]})
      }
    })
})


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
        })
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: "Oops, something went wrong!" })
    })
})

async function checkIds(playlistId, favoriteId) {
  let playlist = await checkAndGetPlaylist(playlistId);
  let favorite = await checkAndGetFavorite(favoriteId);
  let uniqueFavorite = await checkIfPlaylistHasFavorite(playlistId, favoriteId);
  if (uniqueFavorite){
    if (playlist && favorite){
      return {  playlist_id: playlist.id,
        playlist_title: playlist.title,
        favorite_id: favorite.id,
        favorite_title: favorite.title
      }
    } else if (playlist == undefined){
      return {
        "errorStatus": 404,
        "error": "Unable to add favorite to playlist.",
        "detail": "A playlist with that id cannot be found"
      }
    } else if (favorite === undefined){
      return {
        "errorStatus": 404,
        "error": "Unable to add favorite to playlist.",
        "detail": "A favorite with that id cannot be found"
      }
    }
  } else {
    return {
      "errorStatus": 400,
      "error": "Unable to add favorite to playlist.",
      "detail": "That song is already on this playlist."
    }
  }
}

async function checkAndGetPlaylist(id){
  let data = await database('playlists')
    .where({id: id})
    .then(results => {
      if (results.length > 0){
        return results[0]
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: "Oops, something went wrong!" })
    })
  return data
}

async function checkAndGetFavorite(id){
  let data = await database('favorites')
    .where({id: id})
    .then(results => {
      if (results.length > 0){
        return results[0]
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: "Oops, something went wrong!" })
    })
  return data
}

async function checkIfPlaylistHasFavorite(playlistId, favoriteId) {
  let isUnique = await database('playlist_favorites')
    .where({playlist_id: playlistId, favorite_id: favoriteId})
    .select()
    .then(results => {
      if (results.length > 0){
        return false
      } else {
        return true
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: "Oops, something went wrong!" })
    })
  return isUnique
}

module.exports = router;
