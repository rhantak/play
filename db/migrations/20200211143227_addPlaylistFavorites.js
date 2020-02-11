
exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('playlist_favorites', function(table) {
      table.increments('id').primary();

      table.integer('playlist_id').unsigned().notNullable();
      table.foreign('playlist_id').references('id').inTable('playlists');

      table.integer('favorite_id').unsigned().notNullable();
      table.foreign('favorite_id').references('id').inTable('favorites');

      table.timestamps(true, true)
    })
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('playlist_favorites')
  ]);
};
