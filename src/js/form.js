var logger=require('./logger')('Form')
var info=logger.info
var debug=logger.debug
var error=logger.error
var warn=logger.warn
var form
module.exports={
  prepare:prepare
}
function prepare() {
  $(document).ready(function() {
    form = $('#dit-form')
    if (form.length) {
      info('Document is ready')
      var stepped=form.hasClass('stepped')
      prepareForm(stepped)
      prepareAutocomplete()
      checkFormStatus()
      debug('Registering resize listener')
      $(window).on('resize', function() {
        prepareForm()
      })
    } else {
      info('No form found on the page')
    }
  })
}

function prepareForm(stepped) {
  debug('Preparing form, stepped:', stepped)
  enhance(stepped)

  var navListItems = $('div.setup-panel div a'),
    allWells = $('.setup-content'),
    allNextBtn = $('.nextBtn'),
    allPrevBtn = $('.prevBtn'),
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


function enhance(stepped) {
  $('.js_switch').attr('value', 'true')
  $('.location_block').show()
  if(stepped) {
    $('.stepwizard').show()
    $('.nextBtn').show()
    $('.prevBtn').show()
    $('.dit-form-section__step').css('min-height', '70rem')
    $('.dit-form-section__step').removeClass('final_step')
  }
}

function prepareAutocomplete() {
  debug('Preparing form autocomplete')
  $('#country').autocomplete({
    lookup: document.countries,
    onSelect: function(suggestion) {
      $('#country_en').val(document.countries_en[suggestion.data])

    }
  })
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
    } catch(e) {
      warn('Failed scrolling to top')
    }
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


function getUrlVar() {
  var id, hash, hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=')
    id = hash[1]
  }
  return 'IIGB-' + id
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
    success: function() {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        'event': 'formSubmissionSuccess',
        'formId': 'dit-form'
      })
      window.location.href = base_url + 'location-guide/confirmation'
    },
    error: function(xhr, textstatus, e) {
      error('Submit failed!',e)
      window.location.href = base_url + 'enquiries/error/?errorCode=' + 500
    }
  })
  // e.preventDefault()

  function formLoading() {

    var t = $('.dit-form-section__body')

    $('#loading-overlay').css({
      opacity: 0.5,
      display: 'block',
    })

    $('#img-load').css({
      left: t.outerWidth() / 2 - ($('#img-load').width() / 2),
      top: t.outerHeight() / 2,
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
    error: function (xhr, textstatus, e) {
      error('Submit failed!',e)
      window.location.href = base_url + 'enquiries/error/?errorCode=' + 500
    }
  })
  // e.preventDefault()

  function formLoading() {

    var t = $('.dit-form-section__body')

    $('#loading-overlay').css({
      opacity: 0.5,
      display: 'block',
    })

    $('#img-load').css({
      left: t.outerWidth() / 2 - ($('#img-load').width() / 2),
      top: t.outerHeight() / 2,
    })

    $('#loading-overlay').fadeIn()

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


function direction() {
  if (document.direction === 'rtl') {
    return 'right'
  }
  return 'left'
}
