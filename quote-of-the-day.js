'use strict'

const MAX_TAG_COUNT_FOR_RANDOM = 75;
const apiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const searchURL = 'https://favqs.com/api/quotes';
const typesURL = 'https://favqs.com/api/typeahead';
const imgApiKey = '8114a9a6d86e2223ab0959d33e1c59cc5801706d389b206d48f45be1af724b60';
const imgSearchURL = 'https://api.unsplash.com/photos/random';
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
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const d = new Date();
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
  $('.js-results, .js-results-main').empty();
  const tagIdx = Math.floor(random() * MAX_TAG_COUNT_FOR_RANDOM);
  await searchQuoteByTag(tags[tagIdx].name, true);
  getRandomImg();
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
        return {
          responseJson: response.json(),
          tag: tag
        }
      }
      throw new Error(response.statusText);
    })
    .then((res) => {
      if (isMain) {
        displayQuote(res)
      }
      else {
        displayResults(res)
      }
    })
    .catch();
}

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayResults(res) {
  res.responseJson.then(responseJson => {
    const qIdx = Math.floor(random() * responseJson.quotes.length);
    $('.js-results').append(
      `<div class="js-result-box result-box col">
      <div class="js-result-item result-item col" data-url="${quoteEditorUrl(responseJson.quotes[qIdx].id)}">
      <p class="result-body">"${responseJson.quotes[qIdx].body}"</p>
      <p class="result-author">${responseJson.quotes[qIdx].author}</p></div>
      <p class="result-tag">${res.tag}</p><div>`
    );
  });
}

function quoteEditorUrl(quoteID) {
  const currURL = window.location.href;
  return `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-editor.html?quoteID=${quoteID}`;
}

function quoteEditorUrlWithImgID(imgID) {
  const currURL = window.location.href;
  return `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-editor.html?imageID=${imgID}`;
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

function displayQuote(res) {
  res.responseJson.then(responseJson => {
    const qIdx = Math.floor(random() * responseJson.quotes.length);
    if ($('.js-editor').attr('data-url')) {
      $('.js-editor').attr('data-url', `${$('.js-editor').attr('data-url')}&quoteID=${responseJson.quotes[qIdx].id}`);
    }
    else {
      $('.js-editor').attr('data-url', `${quoteEditorUrl(responseJson.quotes[qIdx].id)}`);
    }
    $('.js-quote').html(`"${responseJson.quotes[qIdx].body}"`);
    $('.js-author').html(responseJson.quotes[qIdx].author);
  });
}

function displayImg(responseJson) {
  console.log(responseJson.urls.regular);
  if ($('.js-editor').attr('data-url')) {
    $('.js-editor').attr('data-url', `${$('.js-editor').attr('data-url')}&imageID=${responseJson.id}`);
  }
  else {
    $('.js-editor').attr('data-url', `${quoteEditorUrlWithImgID(responseJson.id)}`);
  }
$('.js-editor').css('background-image', `url(${responseJson.urls.regular})`);
  $('.js-editor').css('height', `calc(800px * ${responseJson.height} / ${responseJson.width})`);
}

async function initialize() {
  for (let i = 0; i < 12; i++) {
    $('#js-month').append(`<option value="${i}">${months[i]}</option>`);
  }
  for (let i = 1; i <= 31; i++) {
    $('#js-day').append(`<option value="${i}">${i}</option>`);
  }
  for (let i = d.getFullYear(); i >= d.getFullYear() - 120; i--) {
    $('#js-year').append(`<option value="${i}">${i}</option>`);
  }
  $('#js-month').find(`option[value="${d.getMonth()}"]`).attr('selected', 'selected');
  $('#js-day').find(`option[value="${d.getDate()}"]`).attr('selected', 'selected');
  $('#js-year').find(`option[value="${d.getFullYear()}"]`).attr('selected', 'selected');
  seed = `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`;
  await getTags();
  searchQuotes();
}

function watchForm() {
  $('#js-month, #js-day, #js-year').change(function(event) {
    $(this).find('option').removeAttr('selected');
    $(this).find(`option[value="${this.value}"]`).attr('selected', 'selected');
  });

  $('.js-form').submit(event => {
    event.preventDefault();
    seed = `${$('#js-year').find('option[selected="selected"]').val()}${$('#js-month').find('option[selected="selected"]').val()}${$('#js-day').find('option[selected="selected"]').val()}`;
    console.log(seed);
    searchQuotes();
  });
  $('.js-results').on('click', '.js-result-item, .js-result-item-main', function(event) {
    window.location = $(this).attr('data-url');
  });
  $('.js-editor').on('click', function(event) {
    window.location = $(this).attr('data-url');
  });
}

function random() {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

$(initialize);
$(watchForm);