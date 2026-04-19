const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const movieModel = require('./movie-model.js');
const genres = require("express/lib/view");

const app = express();

// Parse urlencoded bodies
app.use(bodyParser.json()); 

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, 'files')));

/* Task 1.2: Add a GET /genres endpoint:
   This endpoint returns a sorted array of all the genres of the movies
   that are currently in the movie model.
*/
app.get('/genres', (req, res) => {
  const movies = Object.values(movieModel);

  const genresSet = new Set();
  for (const movie of movies) {
    for (const genre of movie.Genres) {
      genresSet.add(genre);
    }
  }
  const genres = Array.from(genresSet).sort();
  res.send(genres);
})

/* Task 1.4: Extend the GET /movies endpoint:
   When a query parameter for a specific genre is given, 
   return only movies that have the given genre
 */
app.get('/movies', function (req, res) {
  const genre = req.query.genre;
  let movies = Object.values(movieModel);

  if (genre) {
    movies = movies.filter(movie => {
      // Check if the movie's Genres array contains the requested genre
      // Ensure 'Genres' matches the capitalization in your data model [3]
      return movie.Genres && movie.Genres.includes(genre);
    });
  }

  res.json(movies);
  res.send(movies);
})

// Configure a 'get' endpoint for a specific movie
app.get('/movies/:imdbID', function (req, res) {
  const id = req.params.imdbID
  const exists = id in movieModel
 
  if (exists) {
    res.send(movieModel[id])
  } else {
    res.sendStatus(404)    
  }
})

app.put('/movies/:imdbID', function(req, res) {

  const id = req.params.imdbID
  const exists = id in movieModel

  movieModel[req.params.imdbID] = req.body;
  
  if (!exists) {
    res.status(201)
    res.send(req.body)
  } else {
    res.sendStatus(200)
  }
  
})

app.listen(3000)

console.log("Server now listening on http://localhost:3000/")
