# [Play](https://play-rhap.herokuapp.com/)

### Introduction
Website: [https://play-rhap.herokuapp.com/](https://play-rhap.herokuapp.com/)  
Agile Project Board: https://github.com/rhantak/play/projects/1

Play is an API that allows users to search for songs and add them to a list of favorites. Once added, favorites are searchable by ID or as a list of all favorites.

### Initial Setup
- Clone down this repo and `cd` into its main directory
- Run `npm install` to install all dependencies
- Create databases for development and testing by running the following commands:
```
psql
CREATE DATABASE play_dev
CREATE DATABASE play_test
\q
```
- Run `knex migrate:latest` to set up your development database
- Run `knex migrate:latest --env test` before running any tests to set up the test database

### How To Run Tests
The test suite can be run with the following command: `npm test`

### How To Use
- All request URLs should begin with `https://play-rhap.herokuapp.com/api/v1`
##### GET `/favorites`
Sends a list of all favorites in the database.

Example request: `GET /api/v1/favorites` (no params or body required)

Example success response:
```
{ data:
  [
    {
      "id": 1,
      "title": "We Will Rock You",
      "artistName": "Queen"
      "genre": "Rock",
      "rating": 88
    },
    {
      "id": 2,
      "title": "Careless Whisper",
      "artistName": "George Michael"
      "genre": "Pop",
      "rating": 93
    },
  ]
}
```

##### GET `/favorites/:id`
Selects and returns a favorite by id from the database. `id` is a positive integer

Example request: `GET /api/v1/favorites/1`

Example success response:
```
status: 200
body:
  {
    "id": 1,
    "title": "We Will Rock You",
    "artistName": "Queen"
    "genre": "Rock",
    "rating": 88
  }
```

##### POST `/favorites`
Creates a favorite in the database.

Required body of request:
- JSON format
- `title` and `artistName` attributes required

Example request:
```
POST  /api/v1/favorites
body:
{ title: "We Will Rock You", artistName: "Queen" }
```

Example success response:
```
status 201
body:
{
  "id": 1,
  "title": "We Will Rock You",
  "artistName": "Queen"
  "genre": "Rock",
  "rating": 88
}
```

##### DELETE `/favorites/:id`
Deletes a favorite by id from the database. `:id` must be a positive integer.

Example request: `DELETE /api/v1/favorites/1`

Example success response:
```
status: 204
```

##### GET `/playlists`
Sends a list of all favorites in the database.

Example request: `GET /api/v1/playlists` (no params or body required)

Example success response:
```
{
  data: [
    {
      "id": 1,
      "title": "Cleaning House",
      "createdAt": 2019-11-26T16:03:43+00:00,
      "updatedAt": 2019-11-26T16:03:43+00:00
    },
    {
      "id": 2,
      "title": "Running Mix",
      "createdAt": 2019-11-26T16:03:43+00:00,
      "updatedAt": 2019-11-26T16:03:43+00:00
    },
  ]
}
```

##### POST `/playlists`
Creates a playlist in the database.

Required body of request:
- JSON format
- `title` attribute required

Example success response:
```
status: 201

body:
{
  "id": 1,
  "title": "Cleaning House",
  "createdAt": 2019-11-26T16:03:43+00:00,
  "updatedAt": 2019-11-26T16:03:43+00:00,
}
```


##### PUT `/playlists/:id`
Updates a playlist in the database by `id`.

Required body of request:
- JSON format
- `title` attribute required

Example request:
```
PUT /api/v1/playlists/3
body:
{
  "title": "Morning Jams"
}
```

Example success response:
```
status: 200

body:
{
  "id": 3,
  "title": "Morning Jams",
  "createdAt": 2019-11-26T16:03:43+00:00,
  "updatedAt": 2019-11-26T16:03:43+00:00
}
```

##### DELETE `/playlists/:id`
Deletes a playlist by id from the database. `:id` must be a positive integer.

Example request: `DELETE /api/v1/playlists/1`

Example success response:
```
status: 204
```

##### POST `/playlists/:playlist_id/favorites/:favorite_id`
Adds a favorite to a playlist

Example request: `POST /api/v1/playlists/1/favorites/1`

Example success response:
```
status: 201

body:
{
  "Success": "We Will Rock You has been added to Cleaning House!"
}
```

### Schema Design

<img width="189" alt="Screen Shot 2020-02-04 at 5 25 04 PM" src="https://user-images.githubusercontent.com/47759923/73799595-9a137900-4773-11ea-98e9-376aefb898a7.png">

### Tech Stack List
- PostgreSQL (database)
- Node.JS (Main language)
- Express (Backend framework)
- Knex (ORM)
- Jest (Testing)
- jest-fetch-mock (Mocking API responses in tests)

### Core Contributors
- [Alice Post](https://github.com/ap2322)
- [Ryan Hantak](https://github.com/rhantak)
