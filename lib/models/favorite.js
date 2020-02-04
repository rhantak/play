class Favorite {
  constructor(track_data) {
    this.title = track_data.track_name
    this.artistName = track_data.artist_name
    this.genre = this.checkGenre(track_data.primary_genres.music_genre_list)
    this.rating = this.checkRating(track_data.track_rating)
  }

  checkGenre(musicGenreList){
    if(musicGenreList.length === 0){
      return "Unknown";
    } else {
      return musicGenreList[0].music_genre.music_genre_name;
    }
  }

  checkRating(rating){
    let formattedRating = null;
    // if MusixMatch is giving us a number outside of their documented range, we're assuming it's not correct
    // so, if the rating is off, we're storing in the db as null
    if (rating < 0 || rating > 100 || isNaN(rating)){
      return formattedRating;
    } else {
      // rating IS between 0 and 100, so just keep it!
      return rating;
    }
  }
}

module.exports = Favorite;
