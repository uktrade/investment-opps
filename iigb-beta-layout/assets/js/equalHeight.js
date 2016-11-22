// Set elements to the same height (uses height of tallest element)
// idea taken from https://codepen.io/micahgodbolt/pen/FgqLc

equalheight = function (container) {

  var currentTallest = 0,
    currentRowStart = 0,
    rowDivs = [],
    $el,
    topPosition = 0,
    containerChildren = $(container).children();

  $(containerChildren).each(function () {
    $el = $(this).children();    //changing the 'a' element height not the 'li';
    $($el).height('auto');
    topPosition = $el.parent().position().top;  //checking the 'li' element height not the 'a' in this case;

    if (currentRowStart != topPosition) {
      for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
        rowDivs[currentDiv].height(currentTallest);
      }
      rowDivs.length = 0; // empty the array
      currentRowStart = topPosition;
      currentTallest = $el.height();
      rowDivs.push($el);
    } else {
      rowDivs.push($el);
      currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
    }
    for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
      rowDivs[currentDiv].height(currentTallest);
    }
  });
};