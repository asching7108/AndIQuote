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
 * Calls FavQs API: Typeahead to retrieve all authurs and tags.
 * 
 * @param {boolean} author if authors are needed to get
 * @param {boolean} tag if tags are needed to get
 * @param {number} tagMax the max number of tags to get
 * @returns {Promise} Promise object represents the result of the query
 */
function getAuthorsAndTags(author, tag, tagMax) {
  return fetch(GET_TYPE_URL, OPTIONS_Q)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      const res = {};
      if (author) {
        res.authors = parseAuthorsAndTags(responseJson, "author", null);
      }
      if (tag) {
        res.tags = parseAuthorsAndTags(responseJson, "tag", tagMax);
      }
      return res;
    })
    .catch();
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
 * Calls FavQs API: ListQuotes to retrieve quotes matching the query, 
 * and returns a Promise object representing the response in Json.
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
  return fetch(url, OPTIONS_Q)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .catch();
}

/**
 * Calls FavQs API: ListQuotes to retrieve quotes of the given quote ID, 
 * and returns a Promise object representing the response in Json.
 * 
 * @param {string} quoteID the quote ID
 * @returns {Promise} Promise object of the response in Json
 */
function getQuoteByID(quoteID) {
  const url = GET_QUOTE_URL + "/" + quoteID;
  return fetch(url, OPTIONS_Q)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .catch();
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
 * Calls Unsplash API: photos to retrieve a random image, 
 * and returns a Promise object representing the response in Json.
 * 
 * @param {string} tag the tag as the search query
 * @returns {Promise} Promise object of the response in Json
 */
function getRandomImg(tag) {
  const params = {
    orientation: "landscape",
    query: tag ? tag : "scenary"
  };
  console.log(params.query);
  const url = GET_IMG_URL + "/random?" + formatQueryParams(params);
  return fetch(url, OPTIONS_I)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .catch();
}

/**
 * Calls Unsplash API: photos to retrieve the image of the given image ID, 
 * and returns a Promise object representing the response in Json.
 * 
 * @param {string} imageID the image ID
 * @returns {Promise} Promise object of the response in Json
 */
function getImageByID(imageID) {
  const url = GET_IMG_URL + "/" + imageID;
  return fetch(url, OPTIONS_I)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .catch();
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
  const width = $('.js-qotd').css('width');
  const ratio = res.height / res.width;
  $('.js-qotd').css('--ratio', ratio);
  $('.js-qotd').css('height', `calc(${width} * ${ratio})`);
  $('.js-qotd-img').css('width', width);
  $('.js-qotd-img').attr('src', res.urls.regular);
  console.log(res);
  const splitIdx = ATTR_URL_I.lastIndexOf('/');
  const attr_author_url = ATTR_URL_I.slice(0, splitIdx + 1) 
    + "@" + res.user.username
    + ATTR_URL_I.slice(splitIdx);
    console.log(attr_author_url);
  $('.js-img-attr')
    .html(`Photo by <a href="${attr_author_url}">${res.user.name}</a> on <a href="${ATTR_URL_I}">Unsplash</a>`);
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
  prefixURL = prefixURL.slice(0, prefixURL.lastIndexOf("/"));
  let quoteURL = `${prefixURL}/quote-img.html?quoteID=${quoteID}`;
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
    window.location = $(this).attr('data-url');
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
    $('.js-qotd').css('height', width * ratio);
    $('.js-qotd-img').css('width', width);
    $('.js-qotd-img').css('height', width * ratio);
  });
}
