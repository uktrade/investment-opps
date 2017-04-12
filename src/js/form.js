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
 * Separating forms in this manner allows ignoring unnecessary DOM processing
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
window.radioButtonGroup = false

function init() {
  resolveForms()
}

function resolveForms() {
  $('form').each(function() {
    var form = $(this)
    var formBody = $('#old-format')
    debug('formBodyOld', formBody)
    var formBodyNF = $('#new-format')
    debug('formBodyNew', formBodyNF)
    if (form.attr('id') === 'ist-form') {
      debug('Found IST form ', form)
      logger.name('IST Form')
      if (formBody.length > 0) {
        prepareISTForm(form, formBody)
      } else if (formBodyNF.length > 0) {
        prepareISTFormNF(form, formBodyNF)
      }
    } else {
      debug('Found a form', form)
      prepareForm(form)
    }
  })

}

/** IST FORM **/
function prepareISTForm(form, formBody) {
  debug('Preparing')
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
  }

  function prepareSteps() {
    debug('Preparing steps')
    var currentStep = 1
    var nextBtn = form.find('.nextBtn')
    var prevBtn = form.find('.prevBtn')
    var stepWizard = form.find('.stepwizard')
    show(nextBtn, prevBtn, stepWizard)
    var steps = form.find('.dit-form-section__step')
    steps.css('min-height', '70rem')
    steps.removeClass('final_step')
    prepareStep2()
    prepareNavList()
    form.submit(submit)
    adjustSize()

    debug('Registering resize listener')
    $(window).on('resize', function() {
      adjustSize()
    })


    function prepareStep2() {
      debug('Preparing step 2')
      formWrapper.find('#step-2')
        .on('click', '.radio-group a', function() {
          debug('Location option changed to ', $(this))
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
        var target = parseInt($(this).attr('id').split('-')[1])
        debug('Nav item clicked,target:', target)
        gotoStep(target)
      })
      nextBtn.click(next)
      prevBtn.click(previous)
    }

    function submit(e) {
      e.preventDefault()
      next()
      if (currentStep > steps.length) {
        debug('Submitting form')
        submitForm(form, formBody)
      }
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
      var currentNav = stepWizard.find('#step-' + currentStep)
      var nextNav = stepWizard.find('#step-' + step)
      if (step === currentStep) {
        return
      }
      var current = formWrapper.find('#step-' + currentStep)
      debug('Current', current)
      if (step > currentStep) {
        if (!validateInputs(current)) {
          return
        }
        nextNav.removeAttr('disabled')
      }
      go()

      function go() {
        debug('Changing step from ', currentStep, ' to ', step)
        var target = formWrapper.find('#step-' + step)
        debug('Target', target)
        currentNav.removeClass('active-selection')
        nextNav.addClass('active-selection')
        currentStep = step
        adjustSize(true)
        location.hash = '#step-' + currentStep
      }
    }

    function adjustSize(animate) {
      debug('Adjusting size')
      var width = formBody.width()
      debug('Form body size', width)
      $(stepWrappers).each(function() {
        $(this).css('width', width)
      })

      wrap(formWrapper, stepWrappers.length, width)
      shift(formWrapper, (-(currentStep - 1) * width), animate)
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

}



/** IST FORM New Format **/
function prepareISTFormNF(form, formBody) {
  debug('Preparing NF')
  enhanceISTFormNF()

  function enhanceISTFormNF() {
    debug('Enhancing NF')
    setJsSwitch(form)
    setStickyPanel()
    onScroll()
    disableNativeValidation(form)
    prepareStepsNF()
    prepareAutocomplete()
    listenInputsNF(form)
  }

  function prepareStepsNF() {
    debug('Preparing steps NF')
    form.submit(submit)

    function submit(e) {
      e.preventDefault()
      if (!validateInputsNF(formBody)) {
        return
      }

      debug('Submitting form')
      submitFormNF(form, formBody)
    }
  }

  function prepareAutocomplete() {
    debug('Preparing form autocomplete')
    form.find('#country').autocomplete({
      lookup: document.countries,
      onSelect: function (suggestion) {
        form.find('#country_en').val(document.countries_en[suggestion.data])
      }
    })
  }
}



/** OTHER FORMS **/
function prepareForm(form) {
  var formBody = $('.dit-form-section__body')
  var formWrapper = form.find('div').first()
  var width=formBody.width()
  debug('Preparing')
  enhanceForm()
  form.submit(submit)

  function enhanceForm() {
    debug('Enhancing')
    setJsSwitch(form)
    disableNativeValidation(form)
    wrap(formWrapper, 1, width)
    listenInputs(form)
  }

  function submit(e) {
    e.preventDefault()
    if (validateInputs(form)) {
      shift(formWrapper, -1 * width, true)
      submitForm(form, formBody)
    }
  }

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
    debug('Showing', arg)
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

function validateField(field, keepErrors) {
  var required = field.attr('required')
  var formGroup = field.closest('.form-group')
  var validationError = formGroup.find('.validation_error')
  debug('Validating field ', field)
  if (!keepErrors) {
    clearErrors(formGroup)
  }
  var value = field.val()
  var valid = true
  if (required && isEmpty(value)) {
    debug('Validation failed, missing value')
    formGroup.addClass('has-error')
    valid = false
  } else if (field.attr('type') === 'email') {
    if (!isValidEmail(value)) {
      debug('Email validation failed')
      showValidationError()
      valid = false
    }
  } else if (field.hasClass('phone')) {
    if (!isEmpty(value)) {
      if (!isValidPhoneNumber(value)) {
        debug('Phone validation failed')
        showValidationError()
        valid = false
      }
    }
  }

  return valid

  function showValidationError() {
    debug('Showing validation error')
    validationError.css('display', 'block')
  }

}

function listenInputs(parent) {
  parent
    .find('input:not([type=hidden])')
    .filter(':visible')
    .each(function() {
      $(this)
        .blur(function() {
          validateField($(this))
        })
    })

  parent
    .find('select')
    .filter(':visible')
    .each(function() {
      $(this)
        .change(function() {
          validateField($(this))
        })
    })
}

function validateInputs(parent) {
  var valid = true
  var focusOn
  var formGroups = parent.find('.form-group')
  var fields
  if (formGroups.length) {
    formGroups.each(function() {
      var group = $(this)
      debug('Validating form group:', group)
      if (!validateInputs(group)) {
        valid = false
        if (!focusOn) {
          focusOn = getInputs(group).first()
          debug('Focusing on:', focusOn)
          focusOn.focus()
        }
      } else {
        clearErrors(group)
      }
    })
  } else {
    fields = parent.find('input:not([type=hidden]), select')
    fields.each(function() {
      if (!validateField($(this), true)) {
        valid = false
      }
    })
  }
  return valid
}

function clearErrors(formGroup) {
  debug('Clearing errors on form group:', formGroup)
  formGroup.removeClass('has-error')
  var validationError = formGroup.find('.validation_error')
  validationError.hide()
}

function submitForm(form, formBody) {

  info('Submitting form:', form)
  formLoading()
  var base_url = '/' + document.base_url + '/'
  var postUrl = form.attr('action')

  $.ajax({
    type: 'POST',
    url: postUrl,
    data: form.serialize(),
    success: function(data) {
      info('Form submit success, response:', data)
      window.location.href = base_url +
        'enquiries/confirmation/?enquiryId=' + data.enquiryId
    },
    error: function(xhr, textstatus, e) {
      error('Submit failed!', e)
      window.location.href = base_url + 'enquiries/error/?errorCode=' +
        500
    }
  })

  function formLoading() {
    debug('Show overlay')
    var body = formBody
    var overlay = body.find('#loading-overlay')
    var imageLoad = body.find('#img-load')

    overlay.css({
      opacity: 0.5,
      display: 'block',
    })

    var imageCss={
      top: body.outerHeight() / 2
    }
    var margin=body.outerWidth() / 2 - (imageLoad.width() / 2)

    if(direction() === 'left') {
      imageCss.left=margin
    } else {
      imageCss.right=margin
    }
    imageLoad.css(imageCss)

    overlay.fadeIn()

  }
}

function wrap(element, length, width) {
  //wrap into mother div
  var isMother = $('#mother').length
  if (!isMother) {
    element.wrap('<div id="mother" />')
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
  var totalWidth = (length) * width + 5
  element.css({
    width: function() {
      return totalWidth
    }
  })

}

function shift(element, amount, animate) {
  debug('shifting:', element, ' amount:', amount)
  var margin = 'margin-left'
  var style = {}
  style[margin] = amount
  debug('Margin:', style[margin])
  if (animate) {
    element.animate(style, 500)
  } else {
    element.css(style)
  }

}

function isValidEmail(email) {
  var regex = /\S+@\S+\.\S+/
  return regex.test(email)
}

function isValidPhoneNumber(number) {
  if (number.length < 8) {
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

function isEmpty(value) {
  return typeof value === typeof undefined || $.trim(value) === ''
}

function getInputs(parent) {
  return parent.find('input:not([type=hidden]), select').filter(':visible')
}

function validateFieldNF(field, keepErrors) {
  var required = field.attr('required')
  var formGroup = field.closest('.form-group')
  debug('Validating field ', field)
  if (!keepErrors) {
    clearErrorsNF(formGroup)
  }
  var value = field.val()
  var valid = true
  if (field.attr('type') === 'email') {
    if (!isValidEmail(value)) {
      debug('Email validation failed')
      formGroup.addClass('has-error')
      valid = false
    }
  } else if (field.hasClass('phone')) {
    if (!isEmpty(value)) {
      debug('phone is not empty ', value)
      if (!isValidPhoneNumber(value)) {
        debug('Phone validation failed')
        formGroup.addClass('has-error')
        valid = false
      }
    }
  } else if (field.attr('name') === 'organisation[website]') {
    debug('checking website', field)
    if (!isEmpty(value)) {
      debug('website is not empty ', value)
      if (!isValidUrl(value)) {
        debug('Website validation failed')
        formGroup.addClass('has-error')
        valid = false
      }
    } else if (!$('#mailing_list_checkbox').is(':checked')) {
      debug('checking checkbox is not checked')
      formGroup.addClass('has-error')
      valid = false
    }
  } else if (field.attr('type') === 'radio') {
    if (field.is(':checked')) {
      debug('button checked', field)
      window.radioButtonGroup = true
      formGroup.removeClass('has-error')
    } else {
      debug('button not checked', field)
      if (window.radioButtonGroup === false) {
        formGroup.addClass('has-error')
      }
    }
  } else if (required && isEmpty(value)) {
    debug('Validation failed, missing value')
    formGroup.addClass('has-error')
    valid = false
  }

  return valid && window.radioButtonGroup
}

function listenInputsNF(parent) {
  parent
    .find('textarea')
    .filter(':visible')
    .each(function () {
      $(this)
        .blur(function () {
          debug('checking textarea')
          validateFieldNF($(this))
        })
    })

  parent
    .find('input:not([type=hidden])')
    .filter(':visible')
    .each(function () {
      if ($(this).attr('type') === 'radio') {
        $(this).change(function () {
          validateFieldNF($(this))
        })
      } else {
        $(this).blur(function () {
          validateFieldNF($(this))
        })
      }
    })
}

function validateInputsNF(parent) {
  var valid = true
  var focusOn
  var formGroups = parent.find('.form-group')
  var fields
  if (formGroups.length) {
    formGroups.each(function () {
      var group = $(this)
      debug('Validating form group:', group)
      if (!validateInputsNF(group)) {
        valid = false
        if (!focusOn) {
          focusOn = getInputs(group).first()
          debug('Focusing on:', focusOn)
          focusOn.focus()
        }
      } else {
        clearErrorsNF(group)
      }
    })
  } else {
    fields = parent.find('input:not([type=hidden]), textarea')
    fields.each(function () {
      if (!validateFieldNF($(this), true)) {
        valid = false
      }
    })
  }
  return valid
}

function clearErrorsNF(formGroup) {
  debug('Clearing errors on form group:', formGroup)
  formGroup.removeClass('has-error')
}

function submitFormNF(form) {

  info('Submitting form:', form)
  var base_url = '/' + document.base_url + '/'
  var postUrl = form.attr('action')

  $.ajax({
    type: 'POST',
    url: postUrl,
    data: form.serialize(),
    success: function (data) {
      info('Form submit success, response:', data)
      window.location.href = base_url +
        'enquiries/confirmation/?enquiryId=' + data.enquiryId
    },
    error: function (xhr, textstatus, e) {
      error('Submit failed!', e)
      window.location.href = base_url + 'enquiries/error/?errorCode=' +
        500
    }
  })
}

function isValidUrl(url) {
  var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)
  if(res == null)
    return false
  else
    return true
}

function setStickyPanel() {
  var distance = $('#top-navbar').offset().top
  var navbarElementHeight = $('#top-navbar').height()
  var affixElement = $('#fixed-navbar')
  debug('navHeight', navbarElementHeight)
  debug('distance', distance)
// http://stackoverflow.com/questions/3410765/get-full-height-of-element
  var affixElementHeight = $('#fixed-navbar').outerHeight(true)

// https://finiteheap.com/webdev/2014/12/26/bootstrap-affix-flickering.html
  affixElement.parent().height(affixElementHeight)

// http://stackoverflow.com/questions/23797241/resetting-changing-the-offset-of-bootstrap-affix
  $(window).off('.affix')
  affixElement.removeData('bs.affix').removeClass('affix affix-top affix-bottom')


  affixElement.affix({
    offset: {
      // Distance of between element and top page
      top: function () {
        // how much scrolling is done until sticking the panel
        return (this.top = distance)
      }
    }
  })

  // The replacement for the css-file.
  affixElement.on('affix.bs.affix', function () {
    // the absolute position where the sticked panel is to be placed when the fixing event fires (e.g. the panel reached the top of the page).
    affixElement.css('top', +0 + 'px')
    affixElement.css('z-index', 10)
  })
  shiftWindow()
  $(document).on("scroll", onScroll);
}

function shiftWindow() {
  debug('Applying smooth scroll')
  //smoothscrolling and re-positioning to avoid navbar hiding contents
  $('a[href^="#"]').on('click', function (e) {
    // prevent default anchor click behaviour
    e.preventDefault()
    // store hash
    var hash = this.hash
    // animate
    if (hash.length > 0) {
      $('html, body').stop().animate({
        scrollTop: $(hash).offset().top - 160
      }, 600, 'swing', function () {
        window.location.hash = hash
      })
    }
  })
}

function onScroll() {
  var scrollPos = $(document).scrollTop()
  $('#fixed-navbar a').each(function () {
    var currLink = $(this)
    var refElement = $(currLink.attr('href'))
    if (refElement.position().top <= scrollPos + 100 && refElement.position().top + refElement.height() > scrollPos) {
      currLink.addClass('active')
    }
    else {
      currLink.removeClass('active')
    }
  })
}