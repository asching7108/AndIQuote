'use strict'

const GET_QUOTE_URL = 'https://favqs.com/api/quotes';
const GET_TYPE_URL = 'https://favqs.com/api/typeahead';
const API_KEY_Q = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const OPTIONS_Q = {
  headers: new Headers({
    'Authorization': `Token token="${API_KEY_Q}"`
  })
};
const GET_IMG_URL = 'https://api.unsplash.com/photos';
const API_KEY_I = '8114a9a6d86e2223ab0959d33e1c59cc5801706d389b206d48f45be1af724b60';
const OPTIONS_I = {
  headers: new Headers({
    'Authorization': `Client-ID ${API_KEY_I}`
  })
};
const ATTR_URL_I = 'https://unsplash.com/?utm_source=AndIQuote&utm_medium=referral';

/**
 * Retrieves all authurs and tags.
 * 
 * @returns {Promise} Promise object represents the result of the query
 */
function getAuthorsAndTags() {
  return makeQuoteRequest(GET_TYPE_URL);
}

/**
 * Parses and returns the retrieved data of the specified type.
 * 
 * @param {object} responseJson the response in JSON
 * @param {string} type author or tag
 * @param {number} tagMax the max number of tags to get
 * @returns {array} array of the results list
 */
function parseAuthorsAndTags(responseJson, type, tagMax) {
  const res = [];
  if (type == "author") {
    for (let i = 0; i < responseJson.authors.length; i++) {
      res[res.length] = {
        name: responseJson.authors[i].name,
        name_lc: responseJson.authors[i].name.toLowerCase()
      };
    }
  }
  else {
    const max = tagMax ? tagMax : responseJson.tags.length;
    for (let i = 0; i < max; i++) {
      res[res.length] = {
        name: responseJson.tags[i].name,
        count: responseJson.tags[i].count
      };
    }
  }
  return res;
}

/**
 * Retrieves quotes matching the query, and returns a Promise object 
 * representing the response in Json.
 * 
 * @param {string} type the search type of the query
 * @param {string} searchterm the search term of the query
 * @param {number} page the page number of ther query
 * @returns {Promise} Promise object of the response in Json
 */
async function getQuotes(type, searchTerm, page) {
  const params = {
    type: type,
    page: page
  };
  if (searchTerm) {
    params.filter = searchTerm;
  }
  const url = GET_QUOTE_URL + '?' + formatQueryParams(params);
  return makeQuoteRequest(url);
}

/**
 * Retrieves quotes of the given quote ID, and returns a Promise object 
 * representing the response in Json.
 * 
 * @param {string} quoteID the quote ID
 * @returns {Promise} Promise object of the response in Json
 */
function getQuoteByID(quoteID) {
  const url = GET_QUOTE_URL + "/" + quoteID;
  return makeQuoteRequest(url);
}

/**
 * Returns a formatted string of parameter keys and values joined by '&'.
 * 
 * @param {object} params the parameters of the query
 * @returns {string} the formatted string of the parameters
 */
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

/**
 * Calls FavQs API to retrieve quote data.
 * 
 * @param {string} url the url of the request
 * @returns {Promise} Promise object of the response in Json
 */
function makeQuoteRequest(url) {
  return fetch(url, OPTIONS_Q)
    .then(response => {
      let res = response.json();
      if (response.ok) {
        return res;
      }
      res
        .then(res => {
          throw new Error(res)
        })
        .catch(error => {
          $('.js-error-msg').html(error);
        });
    })
}

/**
 * Retrieve a random image, and returns a Promise object representing the 
 * response in Json.
 * 
 * @param {string} tag the tag as the search query
 * @returns {Promise} Promise object of the response in Json
 */
function getRandomImg(tag) {
  const params = {
    orientation: "landscape",
    query: tag ? tag : "scenary"
  };
  const url = GET_IMG_URL + "/random?" + formatQueryParams(params);
  return makeImageRequest(url);
}

/**
 * Retrieves the image of the given image ID, and returns a Promise object 
 * representing the response in Json.
 * 
 * @param {string} imageID the image ID
 * @returns {Promise} Promise object of the response in Json
 */
function getImageByID(imageID) {
  const url = GET_IMG_URL + "/" + imageID;
  return makeImageRequest(url);
}

/**
 * Calls Unsplash API to retrieve image data.
 * 
 * @param {string} url the url of the request
 * @returns {Promise} Promise object of the response in Json
 */
function makeImageRequest(url) {
  return fetch(url, OPTIONS_I)
  .then(response => {
    let res = response.json();
    if (response.ok) {
      return res;
    }
    res
      .then(res => {
        throw new Error(res.errors.join(' '));
      })
      .catch(error => {
        $('.js-error-msg').html(error);
      });
  })
}

/**
 * Adds the quote specified by the index of the query to the html results area.
 *  
 * @param {object} res the response in JSON
 * @param {string} tag the sepecified tag
 * @param {number} i the index of the quote
 */
function addQuote(res, tag, i) {
  if (!tag) {
    if (res.quotes[i].tags[0]) {
      tag = res.quotes[i].tags[0];
    }
    else {
      tag = "general";
    }
  }
  $('.js-results').append(
    `<div class="js-result-box result-box col">
    <div class="js-result-item result-item link col" data-url="${quoteUrl(res.quotes[i].id, tag, null)}">
    <p class="result-body">"${res.quotes[i].body}"</p>
    <p class="result-author">- ${res.quotes[i].author}</p></div>
    <p class="js-result-tag result-tag link">${tag}</p><div>`
  );
}

/**
 * Adds the quote specified by the index of the query to the html qotd area.
 * 
 * @param {object} res the response in JSON
 * @param {number} i the index of the quote
 */
function addQuoteOfTheDay(res, i) {
  if (i) {
    $('.js-qotd-body').html(`"${res.quotes[i].body}"`);
    $('.js-qotd-author').html(`- ${res.quotes[i].author}`);
  }
  else {
    $('.js-qotd-body').html(`"${res.body}"`);
    $('.js-qotd-author').html(`- ${res.author}`);
  }
}

/**
 * Adds the image to the html qotd area.
 * 
 * @param {object} res the response in JSON
 */
function addImage(res) {
  const width = parseFloat($('.js-qotd').css('width'));
  const ratio = res.height / res.width;
  const height = Math.floor(width * ratio);
  $('.js-qotd').css('--ratio', ratio);
  $('.js-qotd').css('height', height);
  $('.js-qotd-img').css('width', width);
  $('.js-qotd-img').attr('src', res.urls.regular);
  const splitIdx = ATTR_URL_I.lastIndexOf('/');
  const attr_author_url = ATTR_URL_I.slice(0, splitIdx + 1) 
    + "@" + res.user.username
    + ATTR_URL_I.slice(splitIdx);
  $('.js-img-attr')
    .html(`Photo by <a href="${attr_author_url}" target="_blank">${res.user.name}</a>
     on <a href="${ATTR_URL_I}" target="_blank">Unsplash</a>`);
}

/**
 * Returns the url of the quote with the given quote id and image id.
 * 
 * @param {string} quoteID the quote id
 * @param {string} tag the tag of the quote
 * @param {string} imageID the image id
 * @returns {string} the url of the quote
 */
function quoteUrl(quoteID, tag, imageID) {
  let prefixURL = window.location.href;
  prefixURL = prefixURL.slice(0, prefixURL.lastIndexOf("AndIQuote/") + 10);
  let quoteURL = `${prefixURL}/quote-img/quote-img.html?quoteID=${quoteID}`;
  if (tag) {
    quoteURL += `&tag=${tag}`;
  }
  if (imageID) {
    quoteURL += `&imageID=${imageID}`;
  }
  return quoteURL;
}

/**
 * Handles clicking on quote events:
 *   open the quote-img page in a new tab with the selected quote.
 */
function selectQuoteHandler() {
  $('.js-results').on('click', '.js-result-item', function(event) {
    window.open(($(this).attr('data-url')), '_blank');
  });
}

/**
 * Handles window resizing events:
 *   resize quote-of-the-day image accordingly.
 */
function windowResizeHandler() {
  $(window).resize(() => {
    const width = parseFloat($('.js-qotd').css('width'));
    const ratio = parseFloat($('.js-qotd').css('--ratio'));
    const height = Math.floor(width * ratio);
    $('.js-qotd').css('height', height);
    $('.js-qotd-img').css('width', width);
    $('.js-qotd-img').css('height', height);
  });
}
