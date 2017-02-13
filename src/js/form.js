/**
 * Form module processes IST form and any other form found on the page.
 *
 * Steps are only handled for IST form( which is defined with id ist-form )
 *
 * All other forms are also js enhanced without any step processing. All required
 * inputs are validated as well as email.
 *
 * Forms are processed on submit.
 *
 * Separating forms in this manner allows ignroing unnneccasry DOM processing
 * if page does not have IST form on it.
 *
 **/
var logger = require('./logger')('Form')
var info = logger.info
var debug = logger.debug
var error = logger.error
module.exports = {
  init: init
}

function init() {
  resolveForms()
}

function resolveForms() {
  $('form').each(function() {
    var form = $(this)
    if (form.attr('id') === 'ist-form') {
      debug('Found IST form ', form)
      logger.name('IST Form')
      prepareISTForm(form)
    } else {
      debug('Found a form', form)
      prepareForm(form)
    }
  })

}

/** IST FORM **/
function prepareISTForm(form) {
  debug('Preparing')
  var formBody = $('.dit-form-section__body')
  var formWrapper = formBody.find('.dit-form-wrapper')
  var stepWrappers = form.find('.setup-content')
  enhanceISTForm()

  function enhanceISTForm() {
    debug('Enhancing')
    setJsSwitch(form)
    disableNativeValidation(form)
    prepareSteps()
    prepareLocationBlock()
    prepareAutocomplete()
    listenInputs(form)
    adjustSize()
  }

  function prepareSteps() {
    debug('Preparing steps')
    var currentStep
    var nextBtn = form.find('.nextBtn')
    var prevBtn = form.find('.prevBtn')
    var submitBtn = form.find('.submitBtn')
    var stepWizard = form.find('.stepwizard')
    show(nextBtn, prevBtn, stepWizard)
    hide(stepWrappers)
    var steps = form.find('.dit-form-section__step')
    steps.css('min-height', '70rem')
    steps.removeClass('final_step')
    prepareStep2()
    prepareNavList()
    gotoStep(1)

    debug('Registering resize listener')
    $(window).on('resize', function() {
      adjustSize()
    })


    function prepareStep2() {
      debug('Preparing step 2')
      form.find('#step-2')
        .on('click', '.radio-group a', function() {
          var sel = $(this).data('title')
          var tog = $(this).data('toggle')
          var parent = $(this).parent()
          parent.next('.' + tog).prop('value', sel)
          parent
            .find('a[data-toggle="' + tog + '"]')
            .not('[data-title="' + sel + '"]')
            .removeClass('active')
            .addClass('notActive')
          parent
            .find('a[data-toggle="' + tog + '"][data-title="' + sel + '"]')
            .removeClass('notActive')
            .addClass('active')
        })
    }

    function prepareNavList() {
      debug('Preparing nav list items')
      var navListItems = form.find('div.setup-panel div a')
      navListItems.click(function(e) {
        e.preventDefault()
        var target = parseInt($(this).attr('href').split('-')[1])
        debug('Nav item clicked,target:', target)
        gotoStep(target)
      })
      nextBtn.click(next)
      prevBtn.click(previous)
    }

    function next() {
      info('Next')
      gotoStep(currentStep + 1)
    }

    function previous() {
      info('Previous')
      gotoStep(currentStep - 1)
    }

    function gotoStep(step) {
      if (step === currentStep) {
        return
      }
      currentStep = currentStep || 1
      var current = formWrapper.find('#step-' + currentStep)
      debug('Current', current)
      if (step > currentStep) {
        if (!validateInputs(current)) {
          return
        }
      }
      go(step >= currentStep)

      function go(forward) {
        debug('Changing step from ', currentStep, ' to ', step)
        // var width = formBody.width()
        // var margin = 'margin-' + direction()
        var animateArg = {}
        // if (forward) {
        //   animateArg[margin] = -(currentStep * width)
        // } else {
        //   animateArg[margin] = -((currentStep - 2) * width)
        // }
        formWrapper.animate(animateArg, 500)
        var target = formWrapper.find('#step-' + step)
        debug('Target', target)
        stepWizard.find('#step-' + currentStep).removeClass('active-selection')
        stepWizard.find('#step-' + step).addClass('active-selection')
        currentStep = step
        current.hide()
        target.show()
        target.find('input:eq(0)').focus()
      }



    }
  }

  function prepareAutocomplete() {
    debug('Preparing form autocomplete')
    form.find('#country').autocomplete({
      lookup: document.countries,
      onSelect: function(suggestion) {
        form.find('#country_en').val(document.countries_en[suggestion.data])
      }
    })
  }


  function prepareLocationBlock() {
    debug('Preparing location block')
    var locationBlock = form.find('.location_block')
    var locationSelectors = form.find('#location_selectors')
    show(locationBlock)
    hide(locationSelectors)
    form.find('#location_radio_yes')
      .click(function() {
        show(locationSelectors)
      })

    form.find('#location_radio_no')
      .click(function() {
        form.find('#location').prop('selectedIndex', 0)
        hide(locationSelectors)
      })
  }

  function adjustSize() {
    debug('Adjusting size')
    var width = formBody.wi
    var isMother = $('#mother').length
    $(stepWrappers).each(function() {
      $(this).css('width', width)
    })

    //wrap into mother div
    if (!isMother) {
      $('.dit-form-wrapper').wrap('<div id="mother" />')
    }
    //assign height width and overflow hidden to mother
    $('#mother').css({
      width: function() {
        return width
      },
      position: 'relative !important',
      overflow: 'hidden'
    })
    //get total of image sizes and set as width for ul
    var totalWidth = (stepWrappers.length) * width + 5
    $('.dit-form-wrapper').css({
      width: function() {
        return totalWidth
      }
    })

  }
}


/** OTHER FORMS **/
function prepareForm(form) {

}

/** Shared form utils **/

function setJsSwitch(form) {
  var jsSwitch = form.find('.js_switch')
  if (jsSwitch.length) {
    debug('Setting js switch')
    jsSwitch.attr('value', 'true')
  }
}

//Disable browser native form validation
function disableNativeValidation(form) {
  form.attr('novalidate', '')
}


/**
 * Show all given elements
 **/
function show() {
  for (var i in arguments) {
    var arg = arguments[i]
    arg.show()
  }
}

/**
 * Hide all given elements
 **/
function hide() {
  for (var i in arguments) {
    var arg = arguments[i]
    debug('Hiding', arg)
    arg.hide()
  }
}

function validateField(field) {
  var required=field.attr('required')
  if(typeof required === typeof undefined || required === false) {
    return true
  }
  debug('Validating ', field)
  var formGroup = field.closest('.form-group')
  var validationError = formGroup.find('validation_error')
  var value = field.val()
  var valid = true
  if (typeof value === typeof undefined || value === '') {
    formGroup.addClass('has-error')
    valid = false
  } else if (field.attr('type') === 'email') {
    if (!isValidEmail(value)) {
      showValidationError()
      valid = false
    }
  } else if (field.hasClass('phone')) {
    if (!isValidPhoneNumber(value)) {
      showValidationError()
      valid = false
    }
  }

  if (valid) {
    clearErrors()
  }
  return valid

  function showValidationError() {
    validationError.css('display', 'block')
  }

  function clearErrors() {
    formGroup.removeClass('has-error')
    validationError.hide()
  }

}

function listenInputs(parent) {
  parent
    .find('input')
    .each(function() {
      $(this)
        .blur(function() {
          validateField($(this))
        })
    })

  parent
    .find('select')
    .each(function() {
      $(this)
        .change(function() {
          validateField($(this))
        })
    })
}

function validateInputs(parent) {
  debug('Validating inputs')
  var valid = true
  parent
    .find('input select')
    .each(function() {
      if (!validateField($(this))) {
        valid = false
      }
    })
  return valid
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
      error('Submit failed!', e)
      window.location.href = base_url + 'enquiries/error/?errorCode=' +
        500
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
      window.location.href = base_url +
        'enquiries/confirmation/?enquiryId=' + data.enquiryId
    },
    error: function(xhr, textstatus, e) {
      error('Submit failed!', e)
      window.location.href = base_url + 'enquiries/error/?errorCode=' +
        500
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
