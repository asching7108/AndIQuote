'use strict'

const quoteApiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const quoteSearchURL = 'https://favqs.com/api/quotes/';
const imgApiKey = '563492ad6f917000010000018c60f917160c416cb597a63958ffb391';
const imgSearchURL = 'https://api.pexels.com/v1/curated/';

function getParam(paramName) {
  const url = window.location.href;
  return url.slice(url.indexOf(`${paramName}`) + paramName.length + 1);
}

function getQuoteByID() {
  const options = {
    headers: new Headers({
      'Authorization': `Token token="${quoteApiKey}"`
    })
  };
  const url = quoteSearchURL + getParam('quoteID');
  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayQuote(responseJson))
    .catch();
}

function getRandomImg() {
  const params = {
    per_page: 1,
    page: Math.floor(Math.random() * 1000)
  };
  const options = {
    headers: new Headers({
      'Authorization': imgApiKey
    })
  };
  const url = imgSearchURL + "?" + formatQueryParams(params);
  fetch(url, options)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => displayImg(responseJson))
  .catch();

}

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayQuote(responseJson) {
  $('.js-quote').html(responseJson.body);
  $('.js-author').html(responseJson.author);
}

function displayImg(responseJson) {
  console.log(responseJson.photos[0].url);
  $('.js-editor').append(`<p>${responseJson.photos[0].url}</p>`);
}

$(getQuoteByID);
$(getRandomImg);