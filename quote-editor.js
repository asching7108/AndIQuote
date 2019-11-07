'use strict'

const apiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const searchURL = 'https://favqs.com/api/quotes/';

function getParam(paramName) {
  const url = window.location.href;
  return url.slice(url.indexOf(`${paramName}`) + paramName.length + 1);
}

function getQuoteByID() {
  const options = {
    headers: new Headers({
      'Authorization': `Token token="${apiKey}"`
    })
  };
  const url = searchURL + getParam('quoteID');
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

function displayResults(responseJson) {
  $('.js-quote').html(responseJson.body);
  $('.js-author').html(responseJson.author);
}

$(getQuoteByID);