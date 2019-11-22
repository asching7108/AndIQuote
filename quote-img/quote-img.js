'use strict'

/**
 * Displays the quote and image based on the parameters of the page url.
 */
function getQuoteImage() {
  const params = getParam();
  $('#js-search-term').val(params.tag);
  const resQuote = getQuoteByID(params.quoteID);
  const resImage = params.imageID ? getImageByID(params.imageID) : getRandomImg(params.tag);
  Promise.all([resQuote, resImage])
    .then(res => {
      addQuoteOfTheDay(res[0]);
      addImage(res[1]);
      $('.js-qotd-img').css('display', 'block');
    });
}

/**
 * Returns parameters from the page url.
 * 
 * @returns {object} an object of the parameters
 */
function getParam() {
  const url = window.location.href;
  const param = {};
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
  return param;
}

/**
 * Handles the download events:
 *   downloads the quote image.
 */
function saveHandler() {
  $('.js-save-btn').click(event => {
    $("html, body").scrollTop(0);
  html2canvas(document.querySelector('#qotd'), {
    scale: 1.2, 
    allowTaint: true, 
    useCORS: true
  })
    .then(canvas => {
      document.body.appendChild(canvas);
      let imgData = canvas.toDataURL('image/jpg').replace("image/jpg", "image/octet-stream");
      let imgLink = document.getElementById('downloadLink');
      imgLink.download = 'my_quote_from_AndIQuote.jpg';
      imgLink.href = imgData;
      imgLink.click();
    });
  });
}

/**
 * Handles the search submittion events:
 *   get a random image of the query and replace the quote image with it.
 */
function submitHandler() {
  $('.js-search-btn').click(event => {
    event.preventDefault();
    $('.js-error-msg').empty();
    const tag = $('#js-search-term').val().toLowerCase();
    getRandomImg(tag)
      .then(res => {
        if (res) {
          addImage(res);
        }
      })
  });
}

/**
 * Initializes the page with event handlers and the display the quote and image 
 * specified by the parameters.
 */
function initialize() {
  getQuoteImage();

  // event handlers
  submitHandler();
  saveHandler();
  windowResizeHandler();
}

initialize();
