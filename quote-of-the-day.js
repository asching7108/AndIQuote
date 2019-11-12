'use strict'

const MAX_TAG_COUNT_FOR_RANDOM = 75;
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
  "funny"/*,
  "faith",
  "home",
  "nature",
  "happiness",
  "freedom",
  "future",
  "strength",
  "health",
  "food" */
]
var seed;

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

async function searchQuotes() {
  $('.js-results').empty();
  const tagIdx = Math.floor(random() * MAX_TAG_COUNT_FOR_RANDOM);
  await searchQuoteByTag(tags[tagIdx].name, true);
  qotdTags.forEach((ele, idx, arr) => {
    searchQuoteByTag(ele, false);
  });
}

function searchQuoteByTag(tag, isMain) {
  const pageCount = tags[tags.findIndex(matchedTagName, tag)].count / 25;
  const pageNumber = Math.floor(random() * pageCount);
  return getRandomQuoteByTag(tag, pageNumber, isMain);
}

function matchedTagName(tag) {
  return tag.name == this;
}

function getRandomQuoteByTag(tag, pageNumber, isMain) {
  const params = {
    filter: tag,
    type: 'tag',
    page: pageNumber
  };
  const url = searchURL + '?' + formatQueryParams(params);
  return fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      if (isMain) {
        displayResultsMain(responseJson)
      }
      else {
        displayResults(responseJson)
      }
    })
    .catch();
}

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayResultsMain(responseJson) {
  const qIdx = Math.floor(random() * responseJson.quotes.length);
  $('.js-results-main').append(
    `<div class="js-result-item-main quote-item-main col" data-url="${parseQuoteDataUrl(responseJson.quotes[qIdx].id)}">
    <div class="quote-content-main col">
    <p class="quote-body">"${responseJson.quotes[qIdx].body}"</p>
    <p class="quote-author">${responseJson.quotes[qIdx].author}</p></div></div>`
    );
}

function displayResults(responseJson) {
  const qIdx = Math.floor(random() * responseJson.quotes.length);
  $('.js-results').append(
    `<div class="js-result-item quote-item col" data-url="${parseQuoteDataUrl(responseJson.quotes[qIdx].id)}">
    <div class="quote-content col">
    <p class="quote-body">"${responseJson.quotes[qIdx].body}"</p>
    <p class="quote-author">${responseJson.quotes[qIdx].author}</p></div></div>`
    );
}

function parseQuoteDataUrl(quoteID) {
  const currURL = window.location.href;
  return `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-editor.html?quoteID=${quoteID}`;
}

async function initialize() {
  const d = new Date();
  $('input[id="js-month"]').val(d.getMonth() + 1);
  $('input[id="js-day"]').val(d.getDate());
  $('input[id="js-year"]').val(d.getFullYear());
  seed = `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`;
  console.log(seed);
  await getTags();
  searchQuotes();
}

function watchForm() {
  $('.js-form').submit(event => {
    event.preventDefault();
    seed = `${$('input[id="js-year"]').val()}${$('input[id="js-month"]').val()}${$('input[id="js-day"]').val()}`;
    console.log(seed);
    searchQuotes();
  });
  $('.js-results').click(event => {
    window.location = $(event.target).closest('.js-result-item').attr('data-url');
    console.log($(event.target).closest('.js-result-item').attr('data-url'));
  });
}

function random() {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

$(initialize);
$(watchForm);