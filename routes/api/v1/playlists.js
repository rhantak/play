var express = require('express');
var router = express.Router();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../../knexfile')[environment];
const database = require('knex')(configuration);
const fetch = require("node-fetch");

router.get('/', (request, response) => {
  database('playlists')
    .select("id", "title", "created_at as createdAt", "updated_at as updatedAt")
    .then(result => {
      response.status(200).send({data: result})
    })
    .catch((error) => response.status(500).json({ error: error }))
})

module.exports = router;
