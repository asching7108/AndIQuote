'use strict'

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

function getQuoteImage(params) {
  const resQuote = getQuoteByID(params.quoteID);
  const resImage = params.imageID ? getImageByID(params.imageID) : getRandomImg(params.tag);
  Promise.all([resQuote, resImage])
    .then(res => {
      addQuoteOfTheDay(res[0]);
      addImage(res[1]);
      $('.js-qotd-img').css('display', 'block');
    });
}

function downloadImage() {
  html2canvas(document.querySelector('#qotd'), {
    scale: 1.2, 
    allowTaint: true, 
    useCORS: true
  })
    .then(canvas => {
      document.body.appendChild(canvas);
      let imgData = canvas.toDataURL('image/jpg').replace("image/jpg", "image/octet-stream");
      let imgLink = document.getElementById('downloadLink');
      console.log(imgLink);
      imgLink.download = 'AndIQuote1.jpg';
      imgLink.href = imgData;
      imgLink.click();
    });
}

function saveHandler() {
  $('.js-save-btn').click(event => {
    downloadImage();
  });
}

function submitHandler() {
  $('.js-search-btn').click(event => {
    event.preventDefault();
    const tag = $('#js-search-term').val().toLowerCase();
    getRandomImg(tag)
      .then(res => {
        addImage(res);
      });
  });
}

/**
 * Initializes the page with event handlers and the display the quote and image 
 * specified by the parameters.
 */
function initialize() {
  const params = getParam();
  console.log(params);
  $('#js-search-term').val(params.tag);
  getQuoteImage(params);

  // event handlers
  submitHandler();
  saveHandler();
  windowResizeHandler();
}

initialize();
