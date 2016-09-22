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
        $el = $(this);
        $($el).height('auto');
        topPosition = $el.position().top;

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

//    function equalheight(container) {
//        var currentTallest = 0,
//                rowDivs = [],
//                $el,
//                containerChildren = $(container).children();
//
//        $(containerChildren).each(function () {
//            $el = $(this);
//            $($el).height('auto');
//            rowDivs.push($el);
//            currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
//        });
//
//        for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
//            rowDivs[currentDiv].height(currentTallest);
//        }
//    }