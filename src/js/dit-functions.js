var equalheight = require('./equalHeight')
init()
module.exports = {}
window.getResults = getResults

function showcontent() {
  $('.dit-outer-wrap').show()
}

function removeloading() {
  $('.dit-loading').fadeOut(400)
}

function enhance() {
  enhance_videobg()
}

function playVidTest() {
  $('#heroVideo').on('show.bs.modal', function(e) {
    var extVid = $('.video-wrapper').attr('data-video')
    var ytApi = '<iframe width="560" height="315" src="' + extVid + '" frameborder="0" allowfullscreen></iframe>'
    $('.video-wrapper').append(ytApi)
  })
}

function enhance_videobg() {
  if ($('#bgVid').length > 0 || $('#bgImg').length > 0) {
    $('.jumbotron').addClass('bg--transparent')
  }
}

function heroVideoReload() {
  $('#closeHeroVideo').click(function() {
    $('#heroVideo iframe').attr('src', $('#heroVideo iframe').attr('src'))
  })
}

function onLoaded() {
  try {
    smoothScroll()
    addActive()
    checkHeight()
    setGradientHeight()
    selector()
    prepareForm()
    formAutocomplete()
    checkFormStatus()
    ifOtherSelected()
    search()
    jsSearch()
    responsiveTable()
    heroVideoReload()
    playVidTest()
    jsEnhanceExternalLinks()
  } catch (e) {
    console.error(e)
  }
  removeloading()
}

function formAutocomplete() {


  $('#country').autocomplete({
    lookup: document.countries,
    onSelect: function(suggestion) {
      $('#country_en').val(document.countries_en[suggestion.data])

    }
  })
}

function init() {

  var is_root = location.pathname == '/'

  if (is_root) {
    checkGeoLocation()
  } else {
    loaded()
  }
}


function loaded() {
  $(document).ready(function() {
    enhance()
    // setTimeout(showcontent, 500)
    // setTimeout(onLoaded, 800)
    onLoaded()
  })

  $(window).on('resize', function() {
    checkHeight()
    setGradientHeight()
    prepareForm()
  })

}

function checkGeoLocation() {
  $.getJSON('//freegeoip.net/json/', function() {})
  .done(function(data) {
    getRedirectPath(data.country_code)
  })
  .fail(function() {
    loaded()
  })
}

function getRedirectPath(countryCode) {
  //TODO move lookup table to more stable location
  $.getJSON('https://cdn.rawgit.com/uktrade/iigb-beta-structure/develop/redirects/ip_redirects.json', function(data) {})
  .done(function(data) {
    doRedirect(data[countryCode])
  })
  .fail(function() {
    loaded()
  })
}

function doRedirect(redirectLocation) {
  if (redirectLocation == undefined || redirectLocation == '') {
    window.location.pathname = '/int/'
  } else {
    window.location.pathname = redirectLocation
  }
}

function smoothScroll() {
  //smoothscrolling and positioning
  $('a[href^="#"]').on('click', function(e) {
    // prevent default anchor click behavior
    e.preventDefault()
    // store hash
    var hash = this.hash
    // animate
    if (hash.length > 0) {
      $('html, body').stop().animate({
        scrollTop: $(hash).offset().top
      }, 600, 'swing', function() {
        window.location.hash = hash
      })
    }
  })
}

function addActive() {
  var url = window.location.pathname
  var base_url = '/' + document.base_url + '/'
  var child = ''
  if (url.match(/\/industries\//)) {
    child = 'industries/'
  } else if (url.match(/\/setup-guide\//)) {
    child = 'setup-guide/'
  } else if (url.match('\/location-guide\/')) {
    child = 'location-guide/'
  } else if (url.match(/\/\w{2,3}\/$/)) {
    child = ''
  }

  if ($('ul.nav a') && base_url) {
    $('ul.nav a[href="' + base_url + child + '"]').parent().addClass('active')
  }
}

function checkHeight() {

  var elem = $('div').find('.check-height')
  if (elem.length > 0) {
    equalheight(elem)
  }
}

function setGradientHeight() {
  var textHeight = $('.jumbotron>.container').height()
  if (textHeight) {
    var gradientHeight = textHeight + 70
    $('head').append('<style>.jumbotron:before {height: ' + gradientHeight + 'px}</style>')
  }
}

function direction() {
  if (document.direction === 'rtl') {
    return 'right'
  }
  return 'left'
}

/* Open search bar */
function openNav() {
  var margin = 'margin-' + direction(),
    animateArg = {},
    box = $('#dit-search-overlay')

  $('.search-results-block').hide()
  $('#searchInput').focus()
  animateArg[margin] = 0

  $(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
      closeNav()
    }
  })

  $('#closebtn-collapse-1').click(function () {
    closeNav()
  })
  box.animate({
    'margin-top': '0px',
    'height': '110px'
  }, 50)
    .animate(animateArg, 250)
    .animate({
      'height': '100%'
  }, 300)
}

/* Close */
function closeNav() {
  var margin = 'margin-' + direction(),
    animateArg = {},
    box = $('#dit-search-overlay')

  animateArg[margin] = '100%'

  $('body').removeClass('overlay-open')
  $('#searchInput').val('')
  $('#search-options').empty()

  box.animate({
    'height': '110px'
  }, 500)
    .animate(animateArg, 900)
  $('.search-results-block').hide()
}

function checkFormStatus() {
  var field = 'enquiryId',
    url = window.location.href,
    formLeftSide = $('.dit-form-section__info'),
    formRightSide = $('.dit-form-section__body'),
    formSuccess = $('#formSuccess'),
    enquiryId = $('#enquiry_Id')

  if (url.indexOf('?' + field + '=') !== -1) {
    formLeftSide.hide()
    formRightSide.hide()
    formSuccess.show()
    try {
      $('html, body').animate({
        scrollTop: $('.dit-form-section').offset().top
      }, 2000)
    } catch(e) {}
    enquiryId.text(getUrlVar())
  } else if (url.indexOf('&' + field + '=') !== -1) {
    formLeftSide.hide()
    formRightSide.hide()
    formSuccess.show()
    $('html, body').animate({
      scrollTop: formSuccess.offset().top
    }, 2000)
    enquiryId.text(getUrlVar())
  }
}

function ifOtherSelected() {
  var industry = $('#industry')
  $('#other').hide()

  industry.change(function() {
    var value = $('#industry option:selected').val()
    if (value.match(':Other')) {
      $('#other').show()
    } else {
      $('#other').hide()
    }
  })
}

function getUrlVar() {
  var id, hash, hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=')
    id = hash[1]
  }
  return 'IIGB-' + id
}

function prepareForm() {

  $('.js_switch').attr('value', 'true')
  $('.stepwizard').show()
  $('.nextBtn').show()
  $('.prevBtn').show()
  $('.location_block').show()
  $('.submitBtnNonjs').hide()
  $('.dit-form-section__step').css('min-height', '70rem')
  $('.dit-form-section__step').removeClass('final_step')

  var navListItems = $('div.setup-panel div a'),
    allWells = $('.setup-content'),
    allNextBtn = $('.nextBtn'),
    allPrevBtn = $('.prevBtn'),
    submitBtn = $('.submitBtn'),
    locationSelectors = $('#location_selectors'),
    locationRadioYes = $('#location_radio_yes'),
    locationRadioNo = $('#location_radio_no')
  allWells.hide()
  locationSelectors.hide()

  locationRadioYes.click(function() {
    locationSelectors.show()
  })

  locationRadioNo.click(function() {
    $('#location').prop('selectedIndex', 0)
    locationSelectors.hide()
  })

  $('#step-2').on('click', '.radio-group a', function() {
    var sel = $(this).data('title'),
      tog = $(this).data('toggle')
    $(this).parent().next('.' + tog).prop('value', sel)
    $(this).parent().find('a[data-toggle="' + tog + '"]').not('[data-title="' + sel + '"]').removeClass('active').addClass('notActive')
    $(this).parent().find('a[data-toggle="' + tog + '"][data-title="' + sel + '"]').removeClass('notActive').addClass('active')
  })

  navListItems.click(function(e) {
    e.preventDefault()
    var $target = $($(this).attr('href')),
      $item = $(this)

    if (!$item.hasClass('disabled')) {
      navListItems.removeClass('active-selection')
      $item.addClass('active-selection')
      allWells.hide()
      $target.show()
      $target.find('input:eq(0)').focus()
    }
  })

  var theStep, theWidth, totalWidth

  $(function() {
    var isMother = $('#mother').length
    theWidth = $('.dit-form-section__body').width()
    theStep = $('.setup-content')
    $(theStep).each(function() {
      $(this).css('width', theWidth)
    })

    //wrap into mother div
    if (!isMother) {
      $('.dit-form-wrapper').wrap('<div id="mother" />')
    }
    //assign height width and overflow hidden to mother
    $('#mother').css({
      width: function() {
        return theWidth
      },
      // height: function() {
      //   return theStep.height()
      // },
      position: 'relative !important',
      overflow: 'hidden'
    })
    //get total of image sizes and set as width for ul
    totalWidth = (theStep.length) * theWidth + 5
    $('.dit-form-wrapper').css({
      width: function() {
        return totalWidth
      }
    })
  })

  allNextBtn.click(function() {
    var curStep = $(this).closest('.setup-content'),
      curStepValue = parseInt(curStep.attr('id').split('-')[1]),
      nextStepWizard = $('div.setup-panel div a[href="#step-' + curStepValue + '"]').parent().next().children('a'),
      curInputs = curStep.find('input, #mailing_list_checkbox, #other, #turnover, #country, #industry, #start_date_month, #start_date_year, #staff'),
      margin = 'margin-' + direction(),
      animateArg = {},
      isValid = true

    $('.form-group').removeClass('has-error')
    for (var i = 0; i < curInputs.length; i++) {
      if (curInputs[i].hasAttribute('required') && curInputs[i].value === '') { //changed for IE8 compatibility
        isValid = false
        $(curInputs[i]).closest('.form-group').addClass('has-error')
      }
      if (curInputs[i].value !== '' && curInputs[i].getAttribute('name') == 'user[email]' && !isValidEmail(curInputs[i].value)) {
        isValid = false
        $(curInputs[i]).closest('.form-group').addClass('has-error')
        $('.validation_error_email').css('display', 'block')
      }
      if (curInputs[i].value !== '' && curInputs[i].getAttribute('name') == 'user[phone]' && !isValidPhoneNumber(curInputs[i].value)) {
        isValid = false
        $(curInputs[i]).closest('.form-group').addClass('has-error')
        $('.validation_error_email').css('display', 'block')
      }
      var value = $('#industry option:selected').val()
      if (curInputs[i].value === '' && curInputs[i].getAttribute('name') == 'user[other]' && value.indexOf('18') >= 0) {
        isValid = false
        $(curInputs[i]).closest('.form-group').addClass('has-error')
        $('.validation_error_other').css('display', 'block')
      }
    }

    if (isValid) {
      animateArg[margin] = -(curStepValue * theWidth)
      $('.dit-form-wrapper').animate(animateArg, 500)
      nextStepWizard.removeAttr('disabled').trigger('click')
      if ($(this).attr('id') === 'ga-send-js') {
        if ($(this).hasClass('optsFormSubmit')) {
          submitOptsForm()
        } else {
          submitForm()
        }
      }
    }
  })

  allPrevBtn.click(function() {
    var curStep = $(this).closest('.setup-content'),
      curStepValue = parseInt(curStep.attr('id').split('-')[1]),
      prevStepWizard = $('div.setup-panel div a[href="#step-' + curStepValue + '"]').parent().prev().children('a'),
      margin = 'margin-' + direction(),
      animateArg = {}

    animateArg[margin] = -((curStepValue - 2) * theWidth)

    $('.dit-form-wrapper').animate(animateArg, 500)
    prevStepWizard.removeAttr('disabled').trigger('click')
  })
}

function submitOptsForm() {

  formLoading()

  var base_url = '/' + document.base_url + '/'
  var form = $('#dit-form')
  var postUrl = form.attr('action')

  $.ajax({
    type: 'POST',
    url: postUrl,
    data: form.serialize(),
    success: function(data) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        'event': 'formSubmissionSuccess',
        'formId': 'dit-form'
      })
      window.location.href = base_url + 'location-guide/confirmation'
    },
    error: function(xhr, textstatus, error) {
      window.location.href = base_url + 'enquiries/error/?errorCode=' + 500
    }
  })
  // e.preventDefault()

  function formLoading() {

    $t = $('.dit-form-section__body')

    $('#loading-overlay').css({
      opacity: 0.5,
      display: 'block',
    })

    $('#img-load').css({
      left: $t.outerWidth() / 2 - ($('#img-load').width() / 2),
      top: $t.outerHeight() / 2,
    })

    $('#loading-overlay').fadeIn()

  }
}

function submitForm() {

  formLoading()

  var base_url = '/' + document.base_url + '/'
  var form = $('#dit-form')
  var postUrl = form.attr('action')

  $.ajax({
    type: 'POST',
    url: postUrl,
    data: form.serialize(),
    success: function(data) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        'event': 'formSubmissionSuccess',
        'formId': 'dit-form'
      })
      window.location.href = base_url + 'enquiries/confirmation/?enquiryId=' + data.enquiryId
    },
    error: function (xhr, textstatus, error) {
      window.location.href = base_url + 'enquiries/error/?errorCode=' + 500
    }
  })
  // e.preventDefault()

  function formLoading() {

    $t = $('.dit-form-section__body')

    $('#loading-overlay').css({
      opacity: 0.5,
      display: 'block',
    })

    $('#img-load').css({
      left: $t.outerWidth() / 2 - ($('#img-load').width() / 2),
      top: $t.outerHeight() / 2,
    })

    $('#loading-overlay').fadeIn()

  }
}

function getResults(size, start) {
  var searchResultsSize = 10,
    box = $('#dit-search-overlay'),
    URL = $(location).attr('href'),
    searchArea = $('#search-options'),
    searchInput = $('#searchInput').val().trim(),
    gateway = 'https://5dle4b7qu3.execute-api.eu-west-1.amazonaws.com/prod',
    country = document.country,
    language = document.language

  var searchUrl = gateway + '?q=(and field="language" "'+ language + '"(and field="country" "' + country + '" (or (term boost=2 field="pagetitle" "' + searchInput + '") (term field="content" "' + searchInput + '") (prefix boost=2 field="pagetitle" "' + searchInput + '") (prefix field="content" "' + searchInput + '"))))&size=' + size + '&start=' + start + '&q.parser=structured'

  if (searchInput === '') {
    searchArea.html('')
  } else if (searchInput.length > 2) {
    $.ajax({
      type: 'GET',
      url: searchUrl,
      success: function(results) {
        searchArea.html('')
        if ('hits' in results) {
          $('.search-results-block').show()
          $('.dit-search-spinner').css('z-index', 1)
          box.animate({
            'height': '100%'
          }, 1000, function() {
            $('body').addClass('overlay-open')
          })

          var searchResults = results.hits.hit
          searchResults.forEach(function(result) {
            var htmlStr = '<div class="search-result"><h3><a href="/' + result.fields.url + '">' + result.fields.pagetitle + '</a></h3>' +
              '<p class="search-result-link">' + 'invest.great.gov.uk/' + result.fields.url + '</p>' +
              '<p class="search-result-snippet">' + (result.fields.intro ? results.fields.intro : '') + '</p></div>'
            if (result.fields.pagetitle !== '') {
              $('#search-options').append(htmlStr)
            }
          })
          if (results.hits.found > searchResultsSize) {
            $('.pagination')
              .show()
              .empty()
              .append('<li><a class="pagination-links"     onclick="getResults(' + searchResultsSize + ',0)">1</a></li>')

            var count = Math.floor(results.hits.found / searchResultsSize)

            if ((Math.floor(results.hits.found % searchResultsSize) !== 0)) {
              count += 1
            }
            for (var x = 2; x <= count; x++) {
              $('.pagination').append('<li><a style="cursor:pointer" onclick="getResults(' + searchResultsSize + ',' + (searchResultsSize * x - (searchResultsSize - 1)) + ')">' + x + '</a></li>')
            }
          } else if (results.hits.found === 0) {
            $('#search-options').append('<p><h3>' + $('.no-results').text() + ' "' + searchInput + '"</h3></p>')
          }
        } else {
          $('#search-options').append('<p><h3>' + $('.search-error').text() + '</h3></p>')
        }
      },
      error: function(xhr, textstatus, error) {
        console.log(error)
      }
    })
  }
}

function jsSearch() {
  var searchButton = $('#searchBtn')

  searchButton.click(function(e) {
    e.preventDefault()
    searchButton.removeAttr('href')
    openNav()
  })
}

function search() {
  var searchResultsSize = 10
  var debouncedSearch = debounce(function() {
    getResults(searchResultsSize, 0)
    $('.dit-search-spinner').css('z-index', 15)
  }, 500)
  $('#searchInput').on('input', debouncedSearch)
}

function debounce(func, wait, immediate) {
  var timeout
  return function() {
    var context = this,
      args = arguments
    var later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

function isValidEmail(email) {
  var regex = /\S+@\S+\.\S+/
  return regex.test(email)
}

function isValidPhoneNumber(number) {
  if (number.length > 8) {
    return false
  } else {
    return true
  }
}


function responsiveTable() {
  var isTable = $('table').length
  if (isTable) {
    $('table').wrap('<div class="dit-table__responsive" />')
  }
}

function selector() {
  $('a[href="/int"]').attr('href', parallelPath('int'))
  $('a[href="/int/zh"]').attr('href', parallelPath('int/zh'))
  $('a[href="/int/de"]').attr('href', parallelPath('int/de'))
  $('a[href="/int/ja"]').attr('href', parallelPath('int/ja'))
  $('a[href="/int/es"]').attr('href', parallelPath('int/es'))
  $('a[href="/int/pt"]').attr('href', parallelPath('int/pt'))
  $('a[href="/int/ar"]').attr('href', parallelPath('int/ar'))
  $('a[href="/us"]').attr('href', parallelPath('us'))
  $('a[href="/cn"]').attr('href', parallelPath('cn'))
  $('a[href="/in"]').attr('href', parallelPath('in'))
  $('a[href="/de"]').attr('href', parallelPath('de'))
  $('a[href="/es"]').attr('href', parallelPath('es'))
  $('a[href="/br"]').attr('href', parallelPath('br'))
  $('a[href="/jp"]').attr('href', parallelPath('jp'))
}

function parallelPath(destination) {
  var language = document.language,
    country = document.country,
    pagePath = document.pagePath,
    pathClipped
  if (country === 'int' && language !== 'en') {
    pathClipped = function() {
      return pagePath.split('/').slice(2).join('/')
    }
  } else {
    pathClipped = function() {
      return pagePath.split('/').slice(1).join('/')
    }
  }
  return '/' + destination + '/' + pathClipped()
}

function jsEnhanceExternalLinks() {
  $(document.links)
    .filter(function() {
      return !this.target
    })
    .filter(function() {
      return this.hostname !== document.domain
    })
    .attr('target', '_blank')
}