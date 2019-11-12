'use strict'

const apiKey = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const quotesURL = 'https://favqs.com/api/quotes';
const typesURL = 'https://favqs.com/api/typeahead';
const options = {
  headers: new Headers({
    'Authorization': `Token token="${apiKey}"`
  })
};
const authors = [];
const tags = [];

function searchQuotes(currStatus) {
  $('.js-results, .js-bottom-line, .js-err-msg').empty();
  currStatus.set("currPage", 0);
  return getQuotes(currStatus);
}

async function getQuotes(currStatus) {
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
  return fetch(url, options)
    .then(response => {
      if (response.ok) {
        return {
          responseJson: response.json(),
          currStatus: currStatus
        };
      }
      throw new Error(response.statusText);
    })
    .then(res => displayResults(res))
    .catch();
}

function getMatchedAuthors(searchTerm) {
  const resAuthors = {
    result: "none",
    matchedAuthors: []
  };
  authors.forEach((ele) => {
    if (ele.name_lc == searchTerm) {
      resAuthors.result = "exact";
    }
    if (ele.name_lc.includes(searchTerm)) {
      resAuthors.matchedAuthors[resAuthors.matchedAuthors.length] = [ele.name, ele.count];
      if (resAuthors.result == "none") {
        resAuthors.result = "maybe";
      }
    }
  });
  return resAuthors;  
}

function getAuthorsAndTags() {
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

function displayResults(res) {
  console.log(res.currStatus.get("type"));
  return res.responseJson.then(responseJson => {
    $('.js-bottom-line').empty();
    if (responseJson.quotes[0].id == 0) {
      if (res.currStatus.get("type") == "keyword") {
        return false;
      }
      else {
        $('.js-err-msg').append('No matched result.');
      }
    }
    if (res.currStatus.get("currPage") == 1) {
      $('.js-filter').find('input').removeClass('selected');
      $('.js-filter')
        .find(`input[value="${res.currStatus.get("searchTerm")}"][name="${res.currStatus.get("type")}-filter"]`)
        .addClass('selected');
    }
    let fixedTag = res.currStatus.get("tag");
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
    res.currStatus.set("lastPage", responseJson.last_page);
    if (responseJson.last_page) {
      $('.js-bottom-line').append("<p>You've reached the end.</p>");
    }
    else {
      $('.js-bottom-line').append('Load more');
    }
    return true;
  });
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
}

function parseQuoteDataUrl(quoteID) {
  const currURL = window.location.href;
  return `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-editor.html?quoteID=${quoteID}`;
}

function watchForm() {
  var currStatus = new Map();
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

  // handles clock on search filters
  $('.js-filter').on('click', 'input[type=button]', function(event) {
    currStatus.set("searchTerm", this.value);
    currStatus.set("type", $(this).attr('name').slice(0, $(this).attr('name').indexOf('-')));
    if (currStatus.get("type") == "tag") {
      currStatus.set("tag", this.value);
    }
    searchQuotes(currStatus);
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

function displayFilter(currStatus, resAuthors) {
  $('.js-filter').empty();
  $('.js-filter').append('<label for="keyword-filter">Keyword:</label>');
  $('.js-filter').append(`<input type="button" name="keyword-filter" class="filter-btn" value="${currStatus.get("searchTerm")}">`);
  if (resAuthors.result != "none") {
    $('.js-filter').append('<label for="author-filter">Author:</label>');
    resAuthors.matchedAuthors.forEach(ele => {
      $('.js-filter').append(`<input type="button" name="author-filter" class="filter-btn" value="${ele[0]}">`);
    });  
  }
  if (tags.find(ele => ele.name == currStatus.get("searchTerm"))) {
    $('.js-filter').append('<label for="tag-filter">Tag:</label>');
    $('.js-filter').append(`<input type="button" name="tag-filter" class="filter-btn" value="${currStatus.get("searchTerm")}">`);
  };
}

function searchHandler(currStatus) {
  currStatus.set("type", "keyword");
  currStatus.set("searchTerm", $('#js-search-term').val().toLowerCase());
  if (!currStatus.get("searchTerm")) {
    searchQuotes(currStatus);
    return;
  }
  const resAuthors = getMatchedAuthors(currStatus.get("searchTerm"));
  displayFilter(currStatus, resAuthors);
  if (resAuthors.result == "exact") {
    currStatus.set("type", "author");
    currStatus.set("searchTerm", resAuthors.matchedAuthors[0][0]);
    searchQuotes(currStatus);  
  }
  else {
    searchQuotes(currStatus)
      .then(hasRes => {
        if (!hasRes) {
          if (resAuthors.result == "maybe") {
            currStatus.set("type", "author");
            currStatus.set("searchTerm", resAuthors.matchedAuthors[0][0]);
            searchQuotes(currStatus);  
          }
          else {
            $('.js-err-msg').append('No matched result.');
          }
        }
      }); 
  }
}

$(watchForm);
getAuthorsAndTags();