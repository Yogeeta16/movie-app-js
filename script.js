// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

const loader = document.querySelector(".loader");

const apiKey = "7b6214f5";
let inputfield = document.getElementById("search_input");
let searchkey = "";

// Add the new input event listener
inputfield.addEventListener(
  "input",
  debounce(function (e) {
    // debugger;
    searchkey = e.target.value;
    if (searchkey.length > 2) {
      showLoader();

      fetchAndRenderData(searchkey);
    }
  }, 300)
);

function showLoader() {
  if (loader.style.visibility !== "visible") {
    loader.classList.add("loader--hidden");
    loader.style.visibility = "visible";
  }
}

function hideLoader() {
  loader.classList.remove("loader--hidden");
  loader.style.visibility = "hidden";
}

async function fetchAndRenderData(searchkey = "harry") {
  apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchkey}`;
  try {
    var resultwindow = document.getElementById("searchResults");
    document.getElementById("movie-selected-card").style.display = "none";
    resultwindow.style.display = "flex";

    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
    if (data.Response == "True") {
      const source = document.getElementById("movie-card").innerHTML;
      const template = Handlebars.compile(source);
      const html = template({ movies: data.Search });
      resultwindow.innerHTML = html;
    } else {
      var resultwindow = document.getElementById("searchResults");
      resultwindow.style.display = "block";
      resultwindow.innerHTML = `
      <div class="notfound-container">
      <div class="img">&#11088; </div>
      <h1>Oops…</h1>
      <p>Something went wrong on our end. </p>
      <p>Search data not found.</p>
    </div>
      `;

      return;
    }

    hideLoader();
  } catch (error) {
    console.log("not found");
    var resultwindow = document.getElementById("searchResults");
    resultwindow.style.display = "block";
    resultwindow.innerHTML = `
    <div className="notfound-container">
              <img src="./svgs/surprised.svg" alt="" />
              <h1>Oops…</h1>
              <p>Something went wrong on our end. </p>
              <p>Try to refresh the page.</p>
          </div>
    `;

    return;
  }
}

window.onload = function () {
  fetchAndRenderData();
  lazyLoad();
};

var movieContainer = document.getElementById("searchResults");

movieContainer.addEventListener("click", function (event) {
  var movieElement = event.target.closest(".movie");
  if (movieElement) {
    var imdbID = movieElement.getAttribute("data-imdbID");
    console.log("Clicked IMDb ID:", imdbID);
    showcardonclick(imdbID);
  }
});

function showcardonclick(imdbID) {
  document.getElementById("searchResults").style.display = "none";
  var movie_selected_card = document.getElementById("movie-selected-card");
  movie_selected_card.style.display = "block";
  showcard(imdbID);
}

function closeMovieCard() {
  var movie_selected_card = document.getElementById("movie-selected-card");
  movie_selected_card.style.display = "none";
  var resultWindow = document.getElementById("searchResults");
  resultWindow.style.display = "flex";
}

async function showcard(imdbID) {
  showLoader();
  const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const selectedMovieCard = document.getElementById("selected-movie-card");

    if (data) {
      hideLoader();
      selectedMovieCard.innerHTML = `
        
            <div class="image_p">
              <img src="${data.Poster}" alt="${data.Title}">
            </div> 
            <div>
              <h1>${data.Title}</h1>
              <div class="ratings">
                <p><img src="./svgs/1289679474.svg">${data.imdbRating} / 10</p>
              </div>
              <p>Released: ${data.Released}</p>
              <p>${data.Plot}</p>
            </div>
            <button id="close_movie" > x </button>
        
        `;
      var closeButton = document.getElementById("close_movie");
      closeButton.addEventListener("click", function () {
        console.log("close");
        closeMovieCard();
      });
    } else {
      console.error(
        "Element with ID 'selected-movie-card' not found in the HTML."
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

const lazyLoadElement = document.querySelector(".lazy-load");

window.addEventListener("scroll", function () {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;

  const lazyLoadThreshold = 100;

  if (scrollHeight - scrollTop - windowHeight < lazyLoadThreshold) {
    lazyLoad();
  }
});
let currentPage = 1; // Track the current page

let resultwindow = document.getElementById("searchResults"); // Define resultwindow

async function lazyLoad() {
  showLoader();
  currentPage++; // Increment the page number for pagination

  try {
    const response = await fetch(apiUrl + `&page=${currentPage}`);
    const data = await response.json();

    if (data.Response == "True") {
      const source = document.getElementById("movie-card").innerHTML;
      const template = Handlebars.compile(source);
      const html = template({ movies: data.Search });
      resultwindow.innerHTML += html; // Append new content to the existing content
    } else {
      // Handle errors or end of results
    }

    hideLoader();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
