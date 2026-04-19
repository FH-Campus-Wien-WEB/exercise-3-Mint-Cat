import { ElementBuilder, ParentChildBuilder } from "./builders.js";
//import {all} from "express/lib/application";


class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function appendMovie(movie, element) {
  const meta = parseInt(movie.Metascore / 10);
  const starsMeta = "★ ".repeat(meta) + "✩ ".repeat(10 - meta);

  const imbdRating = parseInt(movie.imdbRating);
  const startsImdb = "★ ".repeat(imbdRating) + "✩ ".repeat(10 - imbdRating);

  new ElementBuilder("article").id(movie.imdbID)
          .append(new ElementBuilder("img").with("src", movie.Poster))
          .append(new ElementBuilder("h1").text(movie.Title))
          .append(new ElementBuilder("p")
              .append(new ElementBuilder("button").text("Edit")
                    .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
          .append(new ParagraphBuilder().items(
              "Runtime " + formatRuntime(movie.Runtime),
              "\u2022",
              "Released on " +
                new Date(movie.Released).toLocaleDateString("en-US")))
          .append(new ParagraphBuilder().childClass("genre").items(movie.Genres))
          .append(new ElementBuilder("p").text(movie.Plot))
          .append(new ElementBuilder("h2").pluralizedText("Director", movie.Directors))
          .append(new ListBuilder().items(movie.Directors))
          .append(new ElementBuilder("h2").pluralizedText("Writer", movie.Writers))
          .append(new ListBuilder().items(movie.Writers))
          .append(new ElementBuilder("h2").pluralizedText("Actor", movie.Actors))
          .append(new ListBuilder().items(movie.Actors))
          .append(new ElementBuilder("h2").text("MetaScore"))
          .append(new ElementBuilder("p").text(starsMeta + "(" + movie.Metascore + "/100)"))
          .append(new ElementBuilder("h2").text("Imdb Rating"))
          .append(new ElementBuilder("p").text(startsImdb + "(" + movie.imdbRating + "/10)"))
          .appendTo(element);

}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove()
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText)
      for (const movie of movies) {
        appendMovie(movie, mainElement)
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  }

  const url = new URL("/movies", location.href)
  /* Task 1.4. Add query parameter to the url if a genre is given */
  if (genre) {
    url.searchParams.set("genre", genre);
  }

  xhr.open("GET", url.href)
  xhr.send()
}

window.onload = function () {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const listElement = document.querySelector("nav>ul");

    if (xhr.status === 200) {
      /* Task 1.3. Add the genre buttons to the listElement and 
         initialize them with a click handler that calls the 
         loadMovies(...) function above. */
      const genres = JSON.parse(xhr.responseText);


      const li = document.createElement("li");
      const allMovieButton = document.createElement("button");
      allMovieButton.className = "button";
      allMovieButton.textContent = "All Movies";
      allMovieButton.onclick = () => loadMovies();
      li.append(allMovieButton);
      listElement.append(li);

      genres.forEach(element => {
        const genreButton = document.createElement("button");
        const li1 = document.createElement("li");
        genreButton.textContent = element;
        genreButton.onclick = () => loadMovies(element);
        li1.append(genreButton);
        listElement.append(li1);
      })

      /* When a first button exists, we click it to load all movies. */
      const firstButton = document.querySelector("nav button");
      if (firstButton) {
        firstButton.click(loadMovies);
      }
    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  xhr.open("GET", "/genres");
  xhr.send();
};
