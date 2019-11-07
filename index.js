'use strict'

const url = 'https://favqs.com/api/qotd';

function getRandomQuote() {
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

function displayResults(responseJson) {
  $('.js-quote, .js-author').empty();
  $('.js-quote').html(`"${responseJson.quote.body}"`);
  $('.js-author').html(responseJson.quote.author);
}

$(getRandomQuote);