const playlistFavorites = require('express').Router();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../../../knexfile')[environment];
const database = require('knex')(configuration);

playlistFavorites.get('/', (request, response) => {
  let playlistId = request.playlistId;
  return response.send(`${playlistId} and ${info}`)
})

playlistFavorites.post('/:favoriteId', (request, response) => {
  let playlistId = request.playlistId;
  let favoriteId = request.params.favoriteId;

  // check playlistId is in playlist table
  // check favoriteId is in favorite table
  checkIds(playlistId, favoriteId)
    .then(data =>{
      success = {
        "Success": `${data.favorite_title} has been added to ${data.playlist_title}`
      }
      response.status(201).json(success)
    })

  // if both pass, then make new playlist_favorite
})

async function checkAndGetPlaylist(id){
  let data = await database('playlists')
    .where({id: id})
    .then(results => {
      if (results.length > 0){
        return results[0]
      } else {
        return response.status(404).send({
          "error" : "Unable to add favorite to playlist.",
          "detail" : `Could not find a playlist with id ${id}.`
        })
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
      } else {
        return response.status(404).send({
          "error" : "Unable to add favorite to playlist.",
          "detail" : `Could not find a favorite with id ${id}.`
        })
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: "Oops, something went wrong!" })
    })
  return data
}

async function checkIds(playlistId, favoriteId) {
  let playlist = await checkAndGetPlaylist(playlistId);
  let favorite = await checkAndGetFavorite(favoriteId);
  return {  playlist_id: playlist.id,
            playlist_title: playlist.title,
            favorite_id: favorite.id,
            favorite_title: favorite.title
         }
}



module.exports = playlistFavorites;
