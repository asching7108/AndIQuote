'use strict'

const MAX_TAG_COUNT = 75;
const MONTHS = [
  ["Jan", "January"],
  ["Feb", "February"],
  ["Mar", "March"],
  ["Apr", "April"],
  ["May", "May"],
  ["Jun", "June"],
  ["Jul", "July"],
  ["Aug", "August"],
  ["Sep", "September"],
  ["Oct", "October"],
  ["Nov", "November"],
  ["Dec", "December"]
];
const POPULAR_TAGS = [
  "love",
  "life",
  "funny",
  "faith",
  "home",
  "nature",
  "happiness",
  "freedom",
  "future",
  "strength",
  "health",
  "food" 
]

/**
 * Search for pseudorandom quotes using the input date as the random seed.
 * 
 * @param {number} month the month of search
 * @param {number} day the day of search
 * @param {number} year the year of search
 * @param {array} tags the array of tags to search from
 */
function searchQuotes(month, day, year, tags) {
  $('.js-qotd-date').html(`- Quote of ${MONTHS[month][1]} ${day}, ${year} -`);
  // calculate random seed
  $('.js-results, .js-results-main, .js-error-msg').empty();
  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;
  const seed = year.toString().concat(month, day);

  // get quote of the day
  const tagIdx = randomIdx(tags.length, seed);
  const pageCount = tags[tagIdx].count / 25;
  const resQuote = getQuotes("tag", tags[tagIdx].name, randomIdx(pageCount, seed));
  console.log(tags[tagIdx].name);
  const resImage = getRandomImg(tags[tagIdx].name);
  Promise.all([resQuote, resImage])
    .then(res => {
      const idx = randomIdx(res[0].quotes.length, seed);
      addQuoteOfTheDay(res[0], idx);
      if (res[1]) {
        addImage(res[1]);
      };
      $('.js-qotd-img').css('display', 'block');
      if (res[1]) {
        $('.js-qotd').attr('data-url', quoteUrl(res[0].quotes[idx].id, tags[tagIdx].name, res[1].id));
      }
    });

  // get quotes of popular tags of the day
  POPULAR_TAGS.forEach((ele, idx) => {
    getQuotes("tag", ele, randomIdx(idx, seed))
      .then(res => addQuote(res, ele, randomIdx(res.quotes.length, seed)));
  });
}

/**
 * Returns a pseudorandom integer between 0 to range based on the seed.
 * 
 * @param {number} range the range
 * @param {number} seed the random seed
 * @returns {number} a pseudorandom integer between 0 to range
 */
function randomIdx(range, seed) {
  return Math.floor(random(seed) * range);
}

/**
 * Handles selection change events.
 */
function changeSelectionHandler() {
  $('#js-month, #js-day, #js-year').change(function(event) {
    $(this).find('option').removeAttr('selected');
    $(this).find(`option[value="${this.value}"]`).attr('selected', 'selected');
  });
}

/**
 * Returns a pseudorandom number between 0 to 1 based on the seed.
 * 
 * @param {number} seed the random seed
 * @returns {number} a pseudorandom integer number between 0 to 1
 */
function random(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Handles search submittion events:
 *   search for quotes of the selected date.
 */
function submitHandler(tags) {
  $('.js-form').submit(event => {
    event.preventDefault();
    searchQuotes(
      $('#js-month').find('option[selected="selected"]').val(), 
      $('#js-day').find('option[selected="selected"]').val(), 
      $('#js-year').find('option[selected="selected"]').val(),
      tags
    );
  });
}

/**
 * Handles clicking on quote of the day events:
 *   open the quote-img page in a new tab with the selected quote and image.
 */
function selectQotdHandler() {
  $('.js-qotd').on('click', function(event) {
    window.open($(this).attr('data-url'), '_blank');
  });
}

/**
 * Initializes the page with event handlers and performs the initial search.
 */
function initialize() {
  const today = new Date();
  const m = today.getMonth();
  const d = today.getDate();
  const y = today.getFullYear();
  let tags = [];

  // initialize popular tags
  let promise = getAuthorsAndTags();
  promise.then(res => {
    tags = parseAuthorsAndTags(res, "tag", MAX_TAG_COUNT);
  });
  
  // initial search
  promise.then(() => searchQuotes(m, d, y, tags));

  // set default date to current system date
  $('#js-year').append(`<option value="${y}">${y}</option>`);
  $('#js-month').find(`option[value="${m}"]`).attr('selected', 'selected');
  $('#js-day').find(`option[value="${d}"]`).attr('selected', 'selected');
  $('#js-year').find(`option[value="${y}"]`).attr('selected', 'selected');

  // fill in year options
  for (let i = y - 1; i >= y - 120; i--) {
    $('#js-year').append(`<option value="${i}">${i}</option>`);
  }

  // event handlers
  promise.then(() => submitHandler(tags));
  changeSelectionHandler();
  selectQotdHandler();
  selectQuoteHandler();
  windowResizeHandler()
}

initialize();
