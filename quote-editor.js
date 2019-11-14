'use strict'

const quoteApiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const quoteSearchURL = 'https://favqs.com/api/quotes/';
const imgApiKey = '8114a9a6d86e2223ab0959d33e1c59cc5801706d389b206d48f45be1af724b60';
const imgSearchURL = 'https://api.unsplash.com/photos/random';
const imgSearchWithIDURL = 'https://api.unsplash.com/photos/';
const param = {};

function getParam() {
  const url = window.location.href;
  let pos = 0;
  let start = url.indexOf('?', pos) + 1;
  while (true) {
    const equal = url.indexOf('=', pos);
    const end = url.indexOf('&', pos) != -1 ? url.indexOf('&', pos) : url.length;
    param[url.slice(start, equal)] = url.slice(equal + 1, end);
    if (end == url.length) {
      break;
    }
    pos = end + 1;
    start = pos;
  }
  console.log(param);
}

function getQuoteByID() {
  const options = {
    headers: new Headers({
      'Authorization': `Token token="${quoteApiKey}"`
    })
  };
  const url = quoteSearchURL + param.quoteID;
  console.log(url);
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
    orientation: "landscape"
  };
  const options = {
    headers: new Headers({
      'Authorization': `Client-ID ${imgApiKey}`
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

function getImgByID(imageID) {
  const options = {
    headers: new Headers({
      'Authorization': `Client-ID ${imgApiKey}`
    })
  };
  const url = imgSearchWithIDURL + imageID;
  console.log(url);
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
  $('.js-quote').html(`"${responseJson.body}"`);
  $('.js-author').html(responseJson.author);
}

function displayImg(responseJson) {
  console.log(responseJson.urls.regular);
  $('.js-editor').css('background-image', `url(${responseJson.urls.regular})`);
  $('.js-editor').css('height', `calc(800px * ${responseJson.height} / ${responseJson.width})`);
}

getParam();
$(getQuoteByID);
if (param.imageID) {
  getImgByID(param.imageID);
}
else {
  getRandomImg();
}
$('.change-btn').click(event => {
  getRandomImg();
});
