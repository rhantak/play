const playlistFavorites = require('express').Router();

// const environment = process.env.NODE_ENV || 'development';
// const configuration = require('../../../knexfile')[environment];
// const database = require('knex')(configuration);

playlistFavorites.get('/', (request, response) => {
  let playlistId = request.playlistId;
  return response.send(`${playlistId} and ${info}`)
})

playlistFavorites.

module.exports = playlistFavorites;
