'use strict'

const API_KEY = 'bfa731ef5bbb9cde3dd2ef0c60474809';
const GET_QUOTE_URL = 'https://favqs.com/api/quotes';
const GET_TYPE_URL = 'https://favqs.com/api/typeahead';
const OPTIONS = {
  headers: new Headers({
    'Authorization': `Token token="${API_KEY}"`
  })
};
const AUTHORS = [];
const TAGS = [];

/**
 * If the there's no search term entered, search for random quotes,
 * otherwise search for quotes matching the search term.
 * 
 * @param {object} searchTrack the search query tracker
 * @param {object} pageTrack the page tracker
 */
function searchQuotes(searchTrack, pageTrack) {
  searchTrack.type = "keyword";
  searchTrack.searchTerm = $('#js-search-term').val().toLowerCase();
  pageTrack.currPage = 1;
  if (!searchTrack.searchTerm) {
    getQuotes("keyword", null, pageTrack);
  }
  else {
    searchWithSearchTerm(searchTrack, pageTrack);
  }
}

/**
 * Searchs for quotes with the search term by the following steps:
 *   1. If an exactly matched author name is found, search by the author.
 *   2. Else if search by keyword has results, search by keyword.
 *   3. Else if author names containing the keyword are found, search by the first author.
 *   4. Else display a message of no matched results.
 * 
 * @param {object} searchTrack the search query tracker
 * @param {object} pageTrack the page tracker
 */
async function searchWithSearchTerm(searchTrack, pageTrack) {
  let q = searchTrack.searchTerm;
  const resAuthors = getMatchedAuthors(q);
  displayFilter(q, resAuthors);
  let hasRes; 
  if (resAuthors.result == "exact") {
    searchTrack.type = "author";
    q = resAuthors.matchedAuthors[0];
    hasRes = await getQuotes("author", q, pageTrack);
  }
  else {
    hasRes = await getQuotes("keyword", q, pageTrack)
      .then(hasRes => {
        if (!hasRes) {
          if (resAuthors.result == "maybe") {
            searchTrack.type = "author";
            q = resAuthors.matchedAuthors[0];
            getQuotes("author", q, pageTrack);
          }
          else {
            $('.js-err-msg').append('No matched result.');
          }
        }
        return hasRes;
      });
  }
  $('.js-filter')
    .find(`input[value="${q}"][name="${searchTrack.type}-filter"]`)
    .addClass('selected');
  searchTrack.searchTerm = q;
}

/**
 * Updates the selected status of filters and searchs for quotes matching 
 * the selected filter.
 * 
 * @param {*} event the click-on-filter event
 * @param {object} searchTrack the search query tracker
 * @param {object} pageTrack the page tracker
 */
function searchByFilter(event, searchTrack, pageTrack) {
  searchTrack.type = $(event.target).attr('name').slice(0, $(event.target).attr('name').indexOf('-'));
  searchTrack.searchTerm = event.target.value;
  pageTrack.currPage = 1;
  $('.js-filter').find('input').removeClass('selected');
  $('.js-filter')
    .find(`input[value="${searchTrack.searchTerm}"][name="${searchTrack.type}-filter"]`)
    .addClass('selected');
  getQuotes(searchTrack.type, searchTrack.searchTerm, pageTrack)
    .then(hasRes => {
      if (!hasRes) {
        $('.js-err-msg').append('No matched result.');
      }
    });
}

/**
 * Returns an array of authors containing the search term.
 * 
 * @param {string} searchTerm the search term of the query
 * @returns {object} an object of the result and the array of matched authors
 */
function getMatchedAuthors(searchTerm) {
  const resAuthors = {
    result: "none",
    matchedAuthors: []
  };
  AUTHORS.forEach((ele) => {
    if (ele.name_lc.includes(searchTerm)) {
      if (ele.name_lc == searchTerm) {
        resAuthors.result = "exact";
      }
      resAuthors.matchedAuthors[resAuthors.matchedAuthors.length] = ele.name;
      if (resAuthors.result == "none") {
        resAuthors.result = "maybe";
      }
    }
  });
  return resAuthors;  
}

/**
 * Displays filter options matching the search term.
 * 
 * @param {string} searchTerm the search term of the query
 * @param {object} resAuthors an object of the result and the array of matched authors
 */
function displayFilter(searchTerm, resAuthors) {
  $('.js-filter').empty();
  $('.js-filter').append('<label for="keyword-filter">Keyword:</label>');
  $('.js-filter').append(`<input type="button" name="keyword-filter" class="filter-btn" value="${searchTerm}">`);
  if (resAuthors.result != "none") {
    $('.js-filter').append('<label for="author-filter">Author:</label>');
    resAuthors.matchedAuthors.forEach(ele => {
      $('.js-filter').append(`<input type="button" name="author-filter" class="filter-btn" value="${ele}">`);
    });  
  }
  if (TAGS.find(ele => ele == searchTerm)) {
    $('.js-filter').append('<label for="tag-filter">Tag:</label>');
    $('.js-filter').append(`<input type="button" name="tag-filter" class="filter-btn" value="${searchTerm}">`);
  };
}

/**
 * Calls FavQs API: ListQuotes to retrieve quotes matching the query.
 * 
 * @param {string} type the search type of the query
 * @param {string} searchterm the search term of the query
 * @param {object} pageTrack the page tracker
 * @returns {Promise} Promise object represents the result of the query
 */
async function getQuotes(type, searchTerm, pageTrack) {
  if (pageTrack.currPage == 1) {
    $('.js-results, .js-bottom-line, .js-err-msg').empty();
  }
  const params = {
    type: type,
    page: pageTrack.currPage
  };
  if (searchTerm) {
    params.filter = searchTerm;
  }
  const url = GET_QUOTE_URL + '?' + formatQueryParams(params);
  return fetch(url, OPTIONS)
    .then(response => {
      if (response.ok) {
        const res = {
          responseJson: response.json(),
          pageTrack: pageTrack
        };
        if (type == "tag") {
          res.tag = searchTerm;
        }
        return res;
      }
      throw new Error(response.statusText);
    })
    .then(res => displayResults(res))
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
 * Displays the quotes of the query and returns the result.
 *  
 * @param {object} res an object of the response in JSON, the tag and the page tracker
 * @returns {Promise} Promise object represents the result of the query
 */
function displayResults(res) {
  return res.responseJson.then(responseJson => {
    $('.js-bottom-line').empty();
    if (responseJson.quotes[0].id == 0) {
      return false;
    }
    for (let i = 0; i < responseJson.quotes.length; i ++) {
      let tag = res.tag;
      if (!res.tag) {
        if (responseJson.quotes[i].tags[0]) {
          tag = responseJson.quotes[i].tags[0];
        }
        else {
          tag = "general";
        }
      }
      $('.js-results').append(
        `<div class="js-result-box result-box col">
        <div class="js-result-item result-item col" data-url="${quoteEditorUrl(responseJson.quotes[i].id)}">
        <p class="result-body">"${responseJson.quotes[i].body}"</p>
        <p class="result-author">${responseJson.quotes[i].author}</p></div>
        <p class="result-tag">${tag}</p><div>`
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

/**
 * Returns the url of the quote editor with the given quote id.
 * 
 * @param {string} quoteID the quote id
 * @returns {string} the url of the quote editor with quote id
 */
function quoteEditorUrl(quoteID) {
  const currURL = window.location.href;
  return `${currURL.slice(0, currURL.lastIndexOf("/"))}/quote-editor.html?quoteID=${quoteID}`;
}

/**
 * Calls FavQs API: Typeahead to retrieve all authurs and tags.
 */
function getAuthorsAndTags() {
  fetch(GET_TYPE_URL, OPTIONS)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => parseAuthorsAndTags(responseJson))
    .catch();
}

/**
 * Parses and stores the retrieved data from Typeahead.
 * 
 * @param {object} responseJson the response in JSON
 */
function parseAuthorsAndTags(responseJson) {
  for (let i = 0; i < responseJson.authors.length; i++) {
    AUTHORS[AUTHORS.length] = {
      name: responseJson.authors[i].name,
      name_lc: responseJson.authors[i].name.toLowerCase()
    };
  }
  for (let i = 0; i < responseJson.tags.length; i++) {
    TAGS[TAGS.length] = responseJson.tags[i].name;
  }
}

/**
 * Watches for and handles event triggers.
 */
function watchForm() {
  let searchTrack = { type: "keyword" };
  let pageTrack = { currPage: 1 };

  // initializes with a random search
  searchQuotes(searchTrack, pageTrack);

  // handles search with submit button
  $('.js-submit-btn').click(event => {
    event.preventDefault();
    searchQuotes(searchTrack, pageTrack);
  });

  // handles click on search filters
  $('.js-filter').on('click', 'input[type=button]', function(event) {
    searchByFilter(event, searchTrack, pageTrack);
  });

  // handles click on quotes
  $('.js-results').on('click', '.js-result-item', function(event) {
    window.location = $(this).attr('data-url');
  });

  // handles scrolling to the bottom
  $(window).on('scroll', () => {
    let pos = $(window).scrollTop();
    if (pos + $(window).height() === $(document).height()) {
      if (!pageTrack.lastPage) {
        pageTrack.currPage++;
        getQuotes(searchTrack.type, searchTrack.searchTerm, pageTrack);
      }
    }
  });
}

function initializePage() {
  getAuthorsAndTags();
  $('#js-search-term').val("");
  watchForm();  
}

initializePage();
