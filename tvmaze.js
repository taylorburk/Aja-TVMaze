"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const MISSING_IMAGE_URL = "http://tinyurl.com/missing-tv";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */


async function getShowsByTerm(term) {
  const show = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`)
  return [
    {
      id: show.data[0].show.id,
      name: show.data[0].show.name,
      summary: show.data[0].show.summary,
      image: show.data[0].show.image ? show.data[0].show.image.medium : MISSING_IMAGE_URL

    }
  ]
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4" id="dataDiv">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm Show-getEpisodes" id="epBtn">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  //Get the information fron the TV Maze API
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  return episodes;
}

//Function used to append the episodes into the episode section

function populateEpisodes(episodes) { 
  for(let ep = 0; ep < episodes.length; ep++) {
    let li = document.createElement('li');
    li.innerText = `${episodes[ep].name} (season ${episodes[ep].season}, number ${episodes[ep].number})`;
    $("#episodes-list").append($(li));
  }
}

//This is used to press the episodes button and make all the episodes appear
$(document).on("click", "#epBtn", function(evt) {
  $("ul").empty();
  getEpisodesOfShow($("#dataDiv").attr("data-show-id"));
  $("section").css("display","inline");
})


