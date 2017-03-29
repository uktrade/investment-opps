var geoLocation = require('./geo-location')
var form = require('./form')
var iopps = require('./investment_opps')
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
    iopps.init()
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
    showJsEnhancements()
    modal($)
    collapse($)
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
  } else if (url.match('\/investment-opportunities\/')){
    child = 'investment-opportunities/'
    debug('Adding active style to setup guide')
  }else if (url.match('\/location-guide\/')) {
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
  $('#searchInput').focus()
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
  $('#searchInput').val('')
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
    searchInput = $('#searchInput').val().trim(),
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

function showJsEnhancements() {
  $('.non-js-display').hide();
  $('.js-display').show();
}

//Bootstrap v3.3.7 (http://getbootstrap.com) functions
function modal($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.7'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
        .one('bsTransitionEnd', function () {
          that.$element.trigger('focus').trigger(e)
        })
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
      .one('bsTransitionEnd', $.proxy(this.hideModal, this))
      .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
          this.$element[0] !== e.target &&
          !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
        .one('bsTransitionEnd', callback)
        .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
        .one('bsTransitionEnd', callbackRemove)
        .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

function collapse($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
      '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
    [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);
