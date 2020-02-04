class Favorite {
  constructor(track_data) {
    this.title = track_data.track_name
    this.artistName = track_data.artist_name
    this.genre = track_data.primary_genres.music_genre_list[0].music_genre.music_genre_name || "Unknown"
    this.rating = track_data.track_rating // Todo: Check rating is between 0 and 100
  }
}

module.exports = Favorite;
