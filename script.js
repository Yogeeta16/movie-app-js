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
  loader.classList.add("loader--hidden");
  loader.style.display = "flex";
}

function hideLoader() {
  loader.classList.remove("loader--hidden");
  loader.style.display = "none";
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

    hideLoader();
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
      <img src="./svgs/magnifying-glass.svg" alt="" />
      <h1>Oops…</h1>
      <p>Something went wrong on our end. </p>
      <p>Search data not found.</p>
    </div>
      `;
      return;
    }
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
    console.log(data);
    if (data) {
      hideLoader();

      // <button class="close_movie"> X</button>
      selectedMovieCard.innerHTML = `
     
      
      <div class="s-card">

      <div class="image-container" style="background-image: url(${
        data.Poster
      });">
       
          <p>${data.Title}</p>
          <div class="sub-content">
          <p>${data.Released}</p>
          <p><span class="img">&#11088; </span>${data.imdbRating} / 10</p>
          </div>
      </div>
      <div class="content">
          <div class="desktop-view">
              <p>
              <h1>${data.Title}</h1>
              </p>
              <div class="sub-content">
                  <p>${data.Released}</p>
                  <p><span class="img">&#11088; </span>${
                    data.imdbRating
                  } / 10</p>
              </div>
          </div>
  
          <ul>
            ${data.Genre.split(", ")
              .map((genre) => `<li>${genre}</li>`)
              .join("")}
          </ul>
          <p>${data.Plot}</p>
      </div>
      <button id="close_movie" class="close-btn"> X</button>
  </div>`;

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

// ----------------------------------------------------------------------------------------------

const lazyLoadElement = document.querySelector(".lazy-load");

window.addEventListener("scroll", function () {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;

  const lazyLoadThreshold = 10;

  if (scrollHeight - scrollTop - windowHeight < lazyLoadThreshold) {
    lazyLoad();
  }
});

let currentPage = 1;

let resultwindow = document.getElementById("searchResults");
async function lazyLoad() {
  showLoader();
  currentPage++;

  try {
    const response = await fetch(apiUrl + `&page=${currentPage}`);
    const data = await response.json();

    if (data.Response == "True") {
      const source = document.getElementById("movie-card").innerHTML;
      const template = Handlebars.compile(source);
      const html = template({ movies: data.Search });
      resultwindow.innerHTML += html;
    } else {
      console.log("end of all pages");
    }

    hideLoader();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
