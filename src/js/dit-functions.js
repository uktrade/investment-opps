var geoLocation = require('./geo-location')
var form = require('./form')
var equalheight = require('./equalHeight')
var logger = require('./logger')('DIT Functions')
var debug = logger.debug
var error = logger.error
var info = logger.info

main()

function main() {
  var isRoot = location.pathname == '/'
  if (isRoot) {
    geoLocation()
      .done(function(redirecting) {
        if (redirecting) {
          return
        } else {
          init()
        }
      }).fail(function(e) {
        error('Geo location failed!', e)
        init()
      })
  } else {
    init()
  }
}

function init() {
  $(document).ready(function() {
    info('Document is ready')
    listenResize()
    onLoaded()
    form.init()
    window.getResults = getResults
  })

  function listenResize() {
    debug('Registering resize listeners')
    $(window).on('resize', function() {
      checkHeight()
      setGradientHeight()
    })

  }


}

function onLoaded() {
  try {
    enhance()
    smoothScroll()
    addActive()
    checkHeight()
    setGradientHeight()
    selector()
    ifOtherSelected()
    search()
    jsSearch()
    responsiveTable()
    heroVideoReload()
    playVidTest()
    jsEnhanceExternalLinks()
  } catch (e) {
    error('On loaded failed!', e)
  }
  removeloading()
}

function enhance() {
  enhance_videobg()
}


function removeloading() {
  debug('Removing loading overlay')
  $('.dit-loading').fadeOut(400)
  $('.dit-loading-spinner').fadeOut(400)
}

function playVidTest() {
  debug('Playing video')
  $('#heroVideo').on('show.bs.modal', function() {
    var extVid = $('.video-wrapper').attr('data-video')
    var ytApi = '<iframe width="560" height="315" src="' + extVid + '" frameborder="0" allowfullscreen></iframe>'
    $('.video-wrapper').append(ytApi)
  })
}

function enhance_videobg() {
  debug('Enhancing video backgroud')
  if ($('#bgVid').length > 0 || $('#bgImg').length > 0) {
    $('.jumbotron').addClass('bg--transparent')
  }
}

function heroVideoReload() {
  $('#closeHeroVideo').click(function() {
    $('#heroVideo iframe').attr('src', $('#heroVideo iframe').attr('src'))
  })
}

function smoothScroll() {
  debug('Applying smooth scroll')
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
    debug('Adding active style to industries')
  } else if (url.match(/\/setup-guide\//)) {
    child = 'setup-guide/'
    debug('Adding active style to setup guide')
  } else if (url.match('\/location-guide\/')) {
    child = 'location-guide/'
    debug('Adding active style to location guide')
  } else if (url.match(/\/\w{2,3}\/$/)) {
    debug('Not setting active style on current page')
    child = ''
  }

  if ($('ul.nav a') && base_url) {
    $('ul.nav a[href="' + base_url + child + '"]').parent().addClass('active')
  }
}

function checkHeight() {
  debug('Applying equal heights')
  var elem = $('div').find('.check-height')
  if (elem.length > 0) {
    equalheight(elem)
  }
}

function setGradientHeight() {
  debug('SetGradientHeight')
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
  $('#search').focus()
  animateArg[margin] = 0

  $(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
      closeNav()
    }
  })

  $('#closebtn-collapse-1').click(function() {
    closeNav()
  })
  box
    .animate({
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
  $('#search').val('')
  $('#search-options').empty()

  box
    .animate({
      'height': '110px'
    }, 500)
    .animate(animateArg, 900)
  $('.search-results-block').hide()
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



function getResults(size, start) {
  var searchResultsSize = 10,
    box = $('#dit-search-overlay'),
    // URL = $(location).attr('href'),
    searchArea = $('#search-options'),
    searchInput = $('#search').val().trim(),
    gateway = process.env.IIGB_SEARCH || 'https://5dle4b7qu3.execute-api.eu-west-1.amazonaws.com/prod',
    country = document.country,
    language = document.language

  /* eslint-disable quotes */
  var searchUrl = gateway + "/?q=(and field='language' '" + language + "'(and field='country' '" + country + "' (or (term boost=2 field='pagetitle' '" + searchInput + "') (term field='content' '" + searchInput + "') (prefix boost=2 field='pagetitle' '" + searchInput + "') (prefix field='content' '" + searchInput + "'))))&size=" + size + "&start=" + start + "&q.parser=structured"
    /* eslint-enable quotes */

  if (searchInput === '') {
    $('.search-results-block').hide()
    $('.pagination').hide()
    $('.dit-search-spinner').css('z-index', 1)
    searchArea.html('')
  } else if (searchInput.length > 2) {
    $('.dit-search-spinner').css('z-index', 15)
    $.ajax({
      type: 'GET',
      url: searchUrl,
      success: function(results) {
        searchArea.html('')
        if (results && 'hits' in results) {
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
      error: function(xhr, textstatus, e) {
        error('Failed reading search results!', e)
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
      //   $('.dit-search-spinner').css('z-index', 15)
  }, 500)
  $('#search').on('input', debouncedSearch)
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



function responsiveTable() {
  var isTable = $('table').length
  if (isTable) {
    $('table').wrap('<div class="dit-table__responsive" />')
  }
}

function selector() {
  $('.lang-link')
    .each(function() {
      $(this).attr('href', parallelPath($(this).attr('href')))
    })
}

function parallelPath(destination) {
  debug('Applying parallel path, destination:', destination)
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
  return destination + '/' + pathClipped()
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
