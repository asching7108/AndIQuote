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

function searchQuotes(type, searchterm, pageTrack) {
  $('.js-results, .js-bottom-line, .js-err-msg').empty();
  pageTrack.currPage = 1;
  return getQuotes(type, searchterm, pageTrack);
}

function getQuotes(type, searchTerm, pageTrack) {
  const params = {
    type: type,
    page: pageTrack.currPage
  };
  if (searchTerm) {
    params.filter = searchTerm;
  }
  const url = quotesURL + '?' + formatQueryParams(params);
  console.log(url);  // hold
  return fetch(url, options)
    .then(response => {
      if (response.ok) {
        return {
          responseJson: response.json(),
          type: type,
          searchTerm: searchTerm,
          pageTrack: pageTrack
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
      resAuthors.matchedAuthors[resAuthors.matchedAuthors.length] = {
        name: ele.name, 
        count: ele.count
      };
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
  return res.responseJson.then(responseJson => {
    $('.js-bottom-line').empty();
    if (responseJson.quotes[0].id == 0) {
      return false;
    }
    for (let i = 0; i < responseJson.quotes.length; i ++) {
      const tag = res.type == "tag" ? res.searchTerm : responseJson.quotes[i].tags[0];
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
    res.pageTrack.lastPage = responseJson.last_page;
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
  let searchTrack = {};
  let pageTrack = {};
  searchTrack = searchRandomQuotes(pageTrack);
  // handles search submittion
  $('.js-submit-btn').click(function(event) {
    event.preventDefault();
    let searchTerm = $('#js-search-term').val().toLowerCase();
    if (!searchTerm) {
      searchTrack = searchRandomQuotes(pageTrack);
    }
    else {
      searchWithFilter(searchTerm, pageTrack)
        .then(res => {
          searchTrack = res;
        })
    }
  });

  // handles clock on search filters
  $('.js-filter').on('click', 'input[type=button]', function(event) {
    searchTrack.type = $(this).attr('name').slice(0, $(this).attr('name').indexOf('-'));
    searchTrack.searchTerm = this.value;
    $('.js-filter').find('input').removeClass('selected');
    $('.js-filter')
      .find(`input[value="${searchTrack.searchTerm}"][name="${searchTrack.type}-filter"]`)
      .addClass('selected');    
    searchQuotes(searchTrack.type, searchTrack.searchTerm, pageTrack);
  });

  // handles click on the quotes
  $('.js-results').click(event => {
    window.location = $(event.target).closest('.js-result-item').attr('data-url');
    console.log($(event.target).closest('.js-result-item').attr('data-url'));
  });

  // handles scrolling to the bottom
  $(window).on('scroll', function() {
    let pos = $(window).scrollTop();
    if (pos + $(window).height() === $(document).height()) {
      if (!pageTrack.lastPage) {
        pageTrack.currPage++;
        getQuotes(searchTrack.type, searchTrack.searchTerm, pageTrack);  // on hold
      }
    }
  });
}

function displayFilter(searchTerm, resAuthors) {
  $('.js-filter').empty();
  $('.js-filter').append('<label for="keyword-filter">Keyword:</label>');
  $('.js-filter').append(`<input type="button" name="keyword-filter" class="filter-btn" value="${searchTerm}">`);
  if (resAuthors.result != "none") {
    $('.js-filter').append('<label for="author-filter">Author:</label>');
    resAuthors.matchedAuthors.forEach(ele => {
      $('.js-filter').append(`<input type="button" name="author-filter" class="filter-btn" value="${ele.name}">`);
    });  
  }
  if (tags.find(ele => ele.name == searchTerm)) {
    $('.js-filter').append('<label for="tag-filter">Tag:</label>');
    $('.js-filter').append(`<input type="button" name="tag-filter" class="filter-btn" value="${searchTerm}">`);
  };
}

function searchRandomQuotes(pageTrack) {
  searchQuotes("keyword", null, pageTrack)
    .then(res => {
      pageTrack.last_page = false;  // on hold
    });
    console.log("hi");
  return { type: "keyword" }
}

async function searchWithFilter(searchTerm, pageTrack) {
  let type = "keyword";
  const resAuthors = getMatchedAuthors(searchTerm);
  displayFilter(searchTerm, resAuthors);
  let hasRes;
  if (resAuthors.result == "exact") {
    type = "author";
    searchTerm = resAuthors.matchedAuthors[0].name;
    hasRes = await searchQuotes("author", searchTerm, pageTrack);
  }
  else {
    hasRes = await searchQuotes("keyword", searchTerm, pageTrack)
      .then(hasRes => {
        if (!hasRes) {  // no matched results
          if (resAuthors.result == "maybe") {
            type = "author";
            searchTerm = resAuthors.matchedAuthors[0].name;
            searchQuotes("author", searchTerm, pageTrack);
          }
          else {
            $('.js-err-msg').append('No matched result.');
          }
        }
        return hasRes;
      });
  }
  if (hasRes) {
    $('.js-filter')
      .find(`input[value="${searchTerm}"][name="${type}-filter"]`)
      .addClass('selected');      
  }
  return {
    type: type,
    searchTerm: searchTerm
  }
}

$(watchForm);
getAuthorsAndTags();