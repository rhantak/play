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

Example request: GET `/api/v1/favorites` (no params or body required)

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

Example request: GET `/api/v1/favorites/1`

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
