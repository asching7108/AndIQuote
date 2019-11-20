'use strict'

const API_KEY_Q = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const GET_QUOTE_URL = 'https://favqs.com/api/quotes';
const GET_TYPE_URL = 'https://favqs.com/api/typeahead';
const OPTIONS_Q = {
  headers: new Headers({
    'Authorization': `Token token="${API_KEY_Q}"`
  })
};
const API_KEY_I = '8114a9a6d86e2223ab0959d33e1c59cc5801706d389b206d48f45be1af724b60';
const GET_IMG_URL = 'https://api.unsplash.com/photos';
const OPTIONS_I = {
  headers: new Headers({
    'Authorization': `Client-ID ${API_KEY_I}`
  })
};

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
  if (type == "author") {
    const authors = [];
    for (let i = 0; i < responseJson.authors.length; i++) {
      authors[authors.length] = {
        name: responseJson.authors[i].name,
        name_lc: responseJson.authors[i].name.toLowerCase()
      };
    }
    return authors;
  }
  if (type == "tag") {
    const tags = [];
    const max = tagMax ? tagMax : responseJson.tags.length;
    for (let i = 0; i < max; i++) {
      tags[tags.length] = {
        name: responseJson.tags[i].name,
        count: responseJson.tags[i].count
      };
    }
    return tags;
  }
}

/**
 * Calls FavQs API: ListQuotes to retrieve quotes matching the query, 
 * and returns a Promise object representing the response in Json.
 * 
 * @param {string} type the search type of the query
 * @param {string} searchterm the search term of the query
 * @param {object} page the page number
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
 * Adds the quote specified by the index of the query to the html file.
 *  
 * @param {object} responseJson the response in JSON
 * @param {string} tag the sepecified tag
 * @param {number} i the index of the quote
 */
function addQuote(responseJson, tag, i) {
  if (!tag) {
    if (responseJson.quotes[i].tags[0]) {
      tag = responseJson.quotes[i].tags[0];
    }
    else {
      tag = "general";
    }
  }
  $('.js-results').append(
    `<div class="js-result-box result-box col">
    <div class="js-result-item result-item link col" data-url="${quoteUrl(responseJson.quotes[i].id, null)}">
    <p class="result-body">"${responseJson.quotes[i].body}"</p>
    <p class="result-author">- ${responseJson.quotes[i].author}</p></div>
    <p class="js-result-tag result-tag link">${tag}</p><div>`
  );
}


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

function addQuoteImage(res) {
  $('.js-qotd').css('background-image', `url(${res.urls.regular})`);
  $('.js-qotd').css('--ratio', res.height / res.width);
  $('.js-qotd').css('height', `calc(${$('.js-qotd').css('width')} * ${res.height} / ${res.width})`);
}

/**
 * Returns the url of the quote with the given quote id and image id.
 * 
 * @param {string} quoteID the quote id
 * @param {string} imageID the image id
 * @returns {string} the url of the quote
 */
function quoteUrl(quoteID, imageID) {
  const currURL = window.location.href;
  let quoteURL = `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-img.html?quoteID=${quoteID}`;
  if (imageID) {
    quoteURL += `&imageID=${imageID}`;
  }
  return quoteURL;
}

function getRandomImg() {
  const params = {
    orientation: "landscape",
    query: "scenery"
  };
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

function getQuoteByID(quoteID) {
  const url = GET_QUOTE_URL + "/" + quoteID;
  console.log(url);
  return fetch(url, OPTIONS_Q)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .catch();
}

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
 * Handles clicking on quote events.
 */
function selectQuoteHandler() {
  $('.js-results').on('click', '.js-result-item', function(event) {
    window.location = $(this).attr('data-url');
  });
}
