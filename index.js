'use strict'

/**
 * Returns an array of authors containing the search term.
 * 
 * @param {string} searchTerm the search term of the query
 * @param {array} authors the array of all authors
 * @returns {object} an object of the result and the array of matched authors
 */
function getMatchedAuthors(searchTerm, authors) {
  const resAuthors = {
    result: "none",
    matchedAuthors: []
  };
  authors.forEach((ele) => {
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
 * @param {string} tag the tag that matchs the searchTerm
 */
function displayFilter(searchTerm, resAuthors, tag) {
  $('.js-filter').empty();
  $('.js-filter').append('<label for="keyword-filter">Keyword : </label>');
  $('.js-filter').append(`<input type="button" name="keyword-filter" class="filter-btn" value="${searchTerm}">`);
  if (resAuthors && resAuthors.result != "none") {
    $('.js-filter').append('<label for="author-filter">Author : </label>');
    resAuthors.matchedAuthors.forEach(ele => {
      $('.js-filter').append(`<input type="button" name="author-filter" class="filter-btn" value="${ele}">`);
    });  
  }
  if (tag) {
    $('.js-filter').append('<label for="tag-filter">Tag : </label>');
    $('.js-filter').append(`<input type="button" name="tag-filter" class="filter-btn" value="${searchTerm}">`);
  };
}

/**
 * Searchs for quotes with the search term by the following steps:
 *   1. If an exactly matched author name is found, search by the author.
 *   2. Else if search by keyword has results, search by keyword.
 *   3. Else if author names containing the keyword are found, search by the first author.
 *   4. Else display a message of no matched results.
 * 
 * @param {object} s the search query tracker
 * @param {object} p the page tracker
 * @param {array} authors the array of all authors
 * @param {array} tags the array of all tags
 */
function searchWithSearchTerm(s, p, authors, tags) {
  const resAuthors = getMatchedAuthors(s.searchTerm, authors);
  const tag = tags.find(ele => ele.name == s.searchTerm);
  displayFilter(s.searchTerm, resAuthors, tag);
  let promise;
  if (resAuthors.result == "exact") {
    s.type = "author";
    s.searchTerm = resAuthors.matchedAuthors[0];
    promise = newSearch(s.type, s.searchTerm, p);
  }
  else {
    promise = newSearch(s.type, s.searchTerm, p)
      .then(res => {
        if (!res) {
          if (resAuthors.result == "maybe") {
            s.type = "author";
            s.searchTerm = resAuthors.matchedAuthors[0];
            newSearch(s.type, s.searchTerm, p);
          }
          else {
            $('.js-err-msg').append('No matched result.');
          }
        }
      });
  }
  promise.then(res => {
    $('.js-filter')
    .find(`input[value="${s.searchTerm}"][name="${s.type}-filter"]`)
    .addClass('selected');  
  });
}

/**
 * Performs a new search and returns the result.
 * 
 * @param {string} type the type of the query
 * @param {string} searchTerm the searchTerm of the query
 * @param {object} p the page tracker
 * @returns {boolean} the result of the search
 */
function newSearch(type, searchTerm, p) {
  p.currPage = 1;
  return getQuotes(type, searchTerm, 1)
    .then(res => {
      $('.js-results, .js-bottom-line, .js-err-msg').empty();
      if (res.quotes[0].id == 0) {
        return false;
      }
      displayResults(res, type, searchTerm, p);
      return true;
    });
}

/**
 * Gets quotes on the next page.
 * 
 * @param {string} type the type of the query
 * @param {string} searchTerm the searchTerm of the query
 * @param {object} p the page tracker
 */
function nextPage(type, searchTerm, p) {
  p.currPage++;
  getQuotes(type, searchTerm, p.currPage)
    .then(res => {
      $('.js-bottom-line').empty();
      displayResults(res, type, searchTerm, p);
    });
}

/**
 * Displays the quotes of the query.
 * 
 * @param {object} res the response in JSON
 * @param {string} type the type of the query
 * @param {string} searchTerm the searchTerm of the query
 * @param {object} p the page tracker
 */
function displayResults(res, type, searchTerm, p) {
  const tag = type == "tag" ? searchTerm : null;
  for (let i = 0; i < res.quotes.length; i++) {
    addQuote(res, tag, i);
  }
  if (res.last_page) {
    $('.js-bottom-line').html("<p>You've reached the end.</p>");
  }
  else {
    $('.js-bottom-line').html('Load more');
  }
  p.lastPage = res.last_page;
}

/**
 * Handles search submittion events:
 *   if there's no search term entered, search for random quotes,
 *   otherwise search for quotes with the search term.
 * 
 * @param {object} s the search query tracker
 * @param {object} p the page tracker
 * @param {array} authors the array of all authors
 * @param {array} tags the array of all tags
 */
function submitHandler(s, p, authors, tags) {
  $('.js-search-btn').click(event => {
    event.preventDefault();
    s.type = "keyword";
    s.searchTerm = $('#js-search-term').val().toLowerCase();
    if (!s.searchTerm) {
      newSearch(s,type, s.searchTerm, p);
    }
    else {
      searchWithSearchTerm(s, p, authors, tags);
    }
  });
}

/**
 * Handles clicking on filter events:
 *   search for quotes of the selected filter.
 * 
 * @param {object} s the search query tracker
 * @param {object} p the page tracker
 */
function selectFilterHandler(s, p) {
  $('.js-filter').on('click', 'input[type=button]', function(event) {
    s.type = $(this).attr('name').slice(0, $(this).attr('name').indexOf('-'));
    s.searchTerm = this.value;
    $('.js-filter').find('input').removeClass('selected');
    $('.js-filter')
      .find(`input[value="${s.searchTerm}"][name="${s.type}-filter"]`)
      .addClass('selected');
    newSearch(s.type, s.searchTerm, p)
      .then(res => {
        if (!res) {
          $('.js-err-msg').append('No matched result.');
        }
      });
  });  
}

/**
 * Handles clicking on tag event:
 *   search for quotes of the selected tag.
 * 
 * @param {object} s the search query tracker
 * @param {object} p the page tracker
 */ 
function selectTagHandler(s, p) {
  $('.js-results').on('click', '.js-result-tag', function(event) {
    s.type = "tag";
    s.searchTerm = $(this).html();
    displayFilter(s.searchTerm, null, s.searchTerm);
    $('.js-filter')
      .find(`input[value="${s.searchTerm}"][name="${s.type}-filter"]`)
      .addClass('selected');
    newSearch(s.type, s.searchTerm, p);
  });
}

/**
 * Handles scrolling to the bottom event:
 *   if current page is not the last page, get quotes on the next page.
 * 
 * @param {object} s the search query tracker
 * @param {object} p the page tracker
 */
function scrollToBottomHandler(s, p) {
  $(window).on('scroll', () => {
    let pos = $(window).scrollTop();
    if (pos + $(window).height() === $(document).height()) {
      if (!p.lastPage) {
        setTimeout(() => $('.js-bottom-line').html('Loading...'), 500);
        setTimeout(() => nextPage(s.type, s.searchTerm, p), 1000);
      }
    }
  });
}

/**
 * Handles window resizing events: 
 *   change the placeholder of search input accordingly.
 */
function windowResizeHandler() {
  $(window).resize(function() {
    if ($(window).width() < 800) {
      $('.search-term').attr('placeholder', 'Search quotes');
    }
    else {
      $('.search-term').attr('placeholder', 'Search for quotes with keyword, author name or topic');
    }
  });
}

function initialize() {
  let authors = [];             // the array of all authors
  let tags = [];                // the array of all tags
  let s = { type: "keyword" };  // the search tracker
  let p = { currPage: 1 };      // the page tracker
  $('#js-search-term').val("");

  // initialize authors and tags
  let promise = getAuthorsAndTags(true, true)
    .then(res => {
      authors = res.authors;
      tags = res.tags;
    });

  // initial search
  newSearch(s.type, null, p);

  // event handlers
  promise.then(res => submitHandler(s, p, authors, tags));
  selectFilterHandler(s, p);
  selectTagHandler(s, p);
  scrollToBottomHandler(s, p);
  selectQuoteHandler();
  windowResizeHandler();
}

initialize();
