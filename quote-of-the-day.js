'use strict'

var d = new Date();
const apiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const searchURL = 'https://favqs.com/api/quotes';

function getQuotes(searchTerm, pageNumber) {
  const params = {
    //type: ['author', 'tag'],
    page: pageNumber
  };
  if (searchTerm) {
    params.filter = searchTerm;
  }
  const options = {
    headers: new Headers({
      'Authorization': `Token token="${apiKey}"`
    })
  };
  const url = searchURL + '?' + formatQueryParams(params);
  console.log(url);
  fetch(url, options)
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
  $('.js-results').empty();
  console.log(responseJson.quotes.length);
  for (let i = 0; i < 6; i ++) {
    $('.js-results').append(
      `<div class="js-result-item quote-item" data-url="${parseQuoteDataUrl(responseJson.quotes[i].id)}">
      <p>${responseJson.quotes[i].body}</p>
      <p>${responseJson.quotes[i].author}</p>
      </div>`
    );
  }
}

function parseQuoteDataUrl(quoteID) {
  const currURL = window.location.href;
  return `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-editor.html?quoteID=${quoteID}`;
}

function watchForm() {
  $('.js-form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    console.log("hi");
    getQuotes(searchTerm, 1);
  });
  $('.js-results').click(event => {
    window.location = $(event.target).closest('.js-result-item').attr('data-url');
    console.log($(event.target).closest('.js-result-item').attr('data-url'));
  });

}

function initializeDate() {
  $('input[id="js-month"]').val(d.getMonth() + 1);
  $('input[id="js-day"]').val(d.getDate());
  $('input[id="js-year"]').val(d.getFullYear());
}

$(initializeDate);
$(getQuotes(null, 1));
$(watchForm);