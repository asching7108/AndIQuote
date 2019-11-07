'use strict'

const apiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';

const url = 'https://favqs.com/api/qotd';

function getRandomQuote() {
  const params = {
    //q: searchTerm,
    //limit: maxResults,
    api_key: apiKey
  };
  
  const options = {
    headers: new Headers({
      'Authorization': `Token token="${apiKey}"`
    })
  };

  //const url = searchURL;// + '?' + formatQueryParams(params);
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch();
}

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayResults(responseJson) {
  $('.quote, .author').empty();
  $('.quote').html(`"${responseJson.quote.body}"`);
  $('.author').html(responseJson.quote.author);
/*  for (let i = 0; i < responseJson.tags.length; i ++) {
    $('#results-list').append(
      `<li><p>${responseJson.tags[i].name}: ${responseJson.tags[i].count}</p>
      </li>`
    );
  }*/
}

function watchForm() {
  $('#js-form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    const maxResults = $('#js-max-results').val();
    getNationalParks(searchTerm, maxResults);
  });
}

$(getRandomQuote());