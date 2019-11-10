'use strict'

const apiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const quotesURL = 'https://favqs.com/api/quotes';
const typesURL = 'https://favqs.com/api/typeahead';
const options = {
  headers: new Headers({
    'Authorization': `Token token="${apiKey}"`
  })
};
var authors = [];
var tags = [];

function searchQuotes(currStatus) {
  $('.js-results, .js-bottom-line, .js-err-msg').empty();
  currStatus.set("currPage", 0);
  getQuotes(currStatus);
  return currStatus;
}

function getQuotes(currStatus) {
  currStatus.set("currPage", currStatus.get("currPage") + 1);
  const params = {
    type: currStatus.get("type"),
    page: currStatus.get("currPage")
  };
  if (currStatus.get("searchTerm")) {
    params.filter = currStatus.get("searchTerm");
  }
  const url = quotesURL + '?' + formatQueryParams(params);
  console.log(url);
  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => { return displayResults(responseJson) })
    .then(lastPage => currStatus.set("lastPage", lastPage))
    .catch();
}

function getMatchedAuthors(searchTerm) {
  const resAuthors = {
    result: "none",
    matchedAuthors: []
  };
  authors.forEach((obj) => {
    if (obj.name_lc == searchTerm) {
      resAuthors.result = "exact";
    }
    if (obj.name_lc.includes(searchTerm)) {
      resAuthors.matchedAuthors[resAuthors.matchedAuthors.length] = [obj.name, obj.count];
      if (resAuthors.result == "none") {
        resAuthors.result = "maybe";
      }
    }
  });
  return resAuthors;  
}

function getAuthorsAndTags() {
  const options = {
    headers: new Headers({
      'Authorization': `Token token="${apiKey}"`
    })
  };
  const url = typesURL;
  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => parseAuthorsAndTags(responseJson))
    .catch();
}

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayResults(responseJson) {
  $('.js-bottom-line').empty();
  if (responseJson.quotes[0].id == 0) {
    $('.js-err-msg').append('No matched result.');
    return true;
  }
  let fixedTag = "";
  if ($('option[selected="selected"]').val().toLowerCase() == "tag") {
    fixedTag = $('#js-search-term').val();
  }
  for (let i = 0; i < responseJson.quotes.length; i ++) {
    const tag = fixedTag ? fixedTag : responseJson.quotes[i].tags[0];
    $('.js-results').append(
      `<div class="js-result-item quote-item col" data-url="${parseQuoteDataUrl(responseJson.quotes[i].id)}">
      <div class="quote-content col">
      <p class="quote-body">"${responseJson.quotes[i].body}"</p>
      <p class="quote-author">${responseJson.quotes[i].author}</p></div>
      <p class="quote-tag">${tag}</p><div>`
    );
  }
  if (responseJson.last_page) {
    $('.js-bottom-line').append("<p>You've reached the end.</p>");
  }
  else {
    $('.js-bottom-line').append('Load more');
  }
  return responseJson.last_page;
}

function parseAuthorsAndTags(responseJson) {
  for (let i = 0; i < responseJson.authors.length; i++) {
    authors[authors.length] = {
      name: responseJson.authors[i].name,
      name_lc: responseJson.authors[i].name.toLowerCase(),
      count: responseJson.authors[i].count
    };
  }
  for (let i = 0; i < responseJson.tags.length; i++) {
    tags[tags.length] = {
      name: responseJson.tags[i].name,
      count: responseJson.tags[i].count
    };
  }
  console.log(tags);
}

function parseQuoteDataUrl(quoteID) {
  const currURL = window.location.href;
  return `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-editor.html?quoteID=${quoteID}`;
}

function watchForm() {
  var currStatus = new Map();
  currStatus.set("type", "keyword");
  searchHandler(currStatus);
  // handles search submittion
  $('.js-submit-btn').click({map: currStatus}, event => {
    event.preventDefault();
    searchHandler(currStatus);
  });

  // handles search type selection
  $('.js-type-select').change(function(event) {
    $('option').removeAttr('selected');
    $('.js-type-select').find(`option:contains(${this.value})`).attr('selected', 'selected');
    if (currStatus.get("searchTerm")) {
      searchHandler(currStatus);
    }
  });

  // handles click on the quotes
  $('.js-results').click(event => {
    window.location = $(event.target).closest('.js-result-item').attr('data-url');
    console.log($(event.target).closest('.js-result-item').attr('data-url'));
  });

  // handles scrolling to the bottom
  $(window).on('scroll', currStatus, function() {
    let pos = $(window).scrollTop();
    if (pos + $(window).height() === $(document).height()) {
      if (!currStatus.get("lastPage")) {
        getQuotes(currStatus);
      }
    }
  });
}

function searchHandler(currStatus) {
  currStatus.set("searchTerm", $('#js-search-term').val().toLowerCase());
  console.log(currStatus.get("searchTerm"));
  if (currStatus.get("searchTerm")) {
    const resAuthors = getMatchedAuthors(currStatus.get("searchTerm"));
    console.log(resAuthors);
    if (resAuthors.result == "exact") {
      currStatus.set("type", "author");
    }
  }
  searchQuotes(currStatus);  
}

$(watchForm);
getAuthorsAndTags();