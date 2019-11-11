'use strict'

const d = new Date();
const apiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const searchURL = 'https://favqs.com/api/quotes';
const typesURL = 'https://favqs.com/api/typeahead';
const options = {
  headers: new Headers({
    'Authorization': `Token token="${apiKey}"`
  })
};
const tags = [];
const qotdTags = [
  "love",
  "life",
  "funny",
  "faith",
  "home",
  "nature",
  "happiness",
  "freedom",
  "future",
  "strength",
  "health",
  "food"
]

function getTags() {
  const url = typesURL;
  return fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      for (let i = 0; i < responseJson.tags.length; i++) {
        tags[tags.length] = {
          name: responseJson.tags[i].name,
          count: responseJson.tags[i].count
        };
      }
    })
    .catch();
}

function searchQuotes(seed, tag) {
  $('.js-results').empty();
  const pageCount = tags[tags.findIndex(matchedTagName, tag)].count / 25;
  const pageNumber = Math.floor(random(seed) * pageCount);
  getRandomQuote(seed, tag, pageNumber);
}

function matchedTagName(tag) {
  return tag.name == this;
}

function getRandomQuote(seed, tag, pageNumber) {
  const params = {
    filter: tag,
    type: 'tag',
    page: pageNumber
  };
  const url = searchURL + '?' + formatQueryParams(params);
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
  const qIdx = Math.floor(random(seed) * responseJson.quotes.length);
  $('.js-results').append(
    `<div class="js-result-item quote-item" data-url="${parseQuoteDataUrl(responseJson.quotes[qIdx].id)}">
    <p>${responseJson.quotes[qIdx].body}</p>
    <p>${responseJson.quotes[qIdx].author}</p>
    </div>`
  );
}

function parseQuoteDataUrl(quoteID) {
  const currURL = window.location.href;
  return `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-editor.html?quoteID=${quoteID}`;
}

async function initialize() {
  $('input[id="js-month"]').val(d.getMonth() + 1);
  $('input[id="js-day"]').val(d.getDate());
  $('input[id="js-year"]').val(d.getFullYear());
  const seed = `${d.getFullYear()}${d.getMonth()}${d.getDate()}`;
  await getTags();
  searchQuotes(seed, "love");
}

function watchForm() {
  $('.js-form').submit(event => {
    event.preventDefault();
    const seed = `${$('input[id="js-year"]').val()}${$('input[id="js-month"]').val()}${$('input[id="js-day"]').val(d)}`;
    searchQuotes(seed, "love");
  });
  $('.js-results').click(event => {
    window.location = $(event.target).closest('.js-result-item').attr('data-url');
    console.log($(event.target).closest('.js-result-item').attr('data-url'));
  });
}

function random(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

$(initialize);
$(watchForm);