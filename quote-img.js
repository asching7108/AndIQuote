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

function getImage(imageID) {
  let res;
  if (imageID) {
    res = getImageByID(imageID);
  }
  else {
    res = getRandomImg();
  }
  return res;
}

function displayQuote(responseJson) {
  $('.js-qotd-body').html(responseJson.body);
  $('.js-qotd-author').html(responseJson.author);
}

function displayImg(res) {
  $('.js-qotd').css('background-image', `url(${res.urls.regular})`);
  $('.js-qotd').css('--ratio', res.height / res.width);
  $('.js-qotd').css('height', `calc(${$('.js-qotd').css('width')} * ${res.height} / ${res.width})`);
}


function getQuoteOfTheDay() {
  const param = getParam();
  const resQuote = getQuoteByID(param.quoteID);
  const resImage = getImage(param.imageID);
  Promise.all([resQuote, resImage])
    .then(res => addQuoteOfTheDay2(res));
}

function addQuoteOfTheDay2(res, i) {
  if (i) {
    $('.js-qotd-body').html(`"${res[0].quotes[i].body}"`);
    $('.js-qotd-author').html(`- ${res[0].quotes[i].author}`);
    $('.js-qotd').attr('data-url', quoteUrl(res[0].quotes[i].id, res[1].id));
  }
  else {
    $('.js-qotd-body').html(`"${res[0].body}"`);
    $('.js-qotd-author').html(`- ${res[0].author}`);
  }
  console.log($('.js-qotd-img'));
  //let img = new Image();
  //img.src = res[1].urls.regular;
  //img.setAttribute('crossorigin', 'anonymous');

  $('.js-qotd-img').attr('src', res[1].urls.regular);
  $('.js-qotd-img').attr('crossorigin', 'anonymous');
  $('.js-qotd-img').css('width', $('.js-qotd').css('width'));
  //$('.js-qotd').css('background-image', `url(${img.src})`);
  $('.js-qotd').css('--ratio', res[1].height / res[1].width);
  $('.js-qotd').css('height', `calc(${$('.js-qotd').css('width')} * ${res[1].height} / ${res[1].width})`);
}

function addRandomImage() {
  getRandomImg()
    .then(res => {
      const ratio = res.height / res.width;
      const width = parseFloat($('#qotdCanvas').css('width'));
      const height = width * ratio;
      $('#qotdCanvas').css('--ratio', ratio);
      //$('#qotdCanvas').attr('width', width);
      //$('#qotdCanvas').attr('height', height);
      $('#qotdCanvas').css('width', width);
      $('#qotdCanvas').css('height', height);
      console.log(res.urls.regular);
      let img = new Image();
      img.src = res.urls.regular;
      img.setAttribute('crossorigin', 'anonymous');
      $('#qotdCanvas').drawImage({
        source: img,
        width: width,
        height: height,
        fromCenter: false,
        load: getQuote
      });
    });
  }

function getQuote() {
  const param = getParam();
  getQuoteByID(param.quoteID)
    .then(res => {
    $('#qotdCanvas').drawText({
      fillStyle: '#FFFFFF',
      maxWidth: 700,
      align: 'center',
      fontSize: '1.5em',
      lineHeight: 1.5,
      x: 400,
      y: 300,
      fontFamily: 'Verdana, sans-serif',
      text: `"${res.body}"

      - ${res.author}`
    });
  });
}

function changeImage(res) {
  $('.js-qotd').css('background-image', `url(${res.urls.regular})`);
  $('.js-qotd').css('--ratio', res.height / res.width);
  $('.js-qotd').css('height', `calc(${$('.js-qotd').css('width')} * ${res.height} / ${res.width})`);
}

getQuoteOfTheDay();
//addRandomImage();
saveHandler();
$('.change-btn').click(event => {
  addRandomImage();
});
windowResizeHandler();


function saveHandler() {
  $('.save-btn').click(event => {
    /*
    let canvas = document.getElementById('qotdCanvas');
    var img = document.getElementById('download');
    img.setAttribute('download', 'AndIQuote.png');
    img.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    img.click();
    */
    var ele = document.getElementsByClassName('js-qotd');
    console.log(window.devicePixelRatio);
    var canvas = document.getElementById('qotdCanvas');
    $('#qotdCanvas').attr('width', $('.js-qotd').css('width'));
    $('#qotdCanvas').attr('height', parseFloat($('.js-qotd').css('width')) 
    * parseFloat($('.js-qotd').css('--ratio')));
    html2canvas(document.querySelector('.js-qotd'), {scale: 1.2, allowTaint: true, useCORS: true}).then(function(canvas) {
      console.log(canvas);
      document.body.appendChild(canvas);
      let imgData = canvas.toDataURL('image/png').replace("image/jpg", "image/octet-stream");
      var img = document.getElementById('download');
      img.setAttribute('download', 'AndIQuote1.png');
      img.setAttribute('href', imgData);

      img.click();
      });
    });
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

/**
 * Handles window resizing events.
 */
function windowResizeHandler() {
  $(window).resize(function() {
    $('.js-qotd').css(
      'height', 
      parseFloat($('.js-qotd').css('width')) 
        * parseFloat($('.js-qotd').css('--ratio'))
    );
    $('.js-qotd-img').css('width', $('.js-qotd').css('width'));

    $('.js-qotd-img').css(
      'height', 
      parseFloat($('.js-qotd').css('width')) 
        * parseFloat($('.js-qotd').css('--ratio'))
    );  
  });
}