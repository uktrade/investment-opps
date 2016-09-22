function chunk(arr, size) {
    var chunkedArr = [],
        noOfChunks = size,
        args = [],
        addendum = [],
        chunkSize = (function () {
            var leftOver = arr.length % size;
            if (!leftOver) {
                return arr.length / size;
            } else {
                return parseInt(arr.length / size) + 1;
            }
        })();

    for (var i = 0; i < noOfChunks; i++) {
        chunkedArr.push(arr.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    for (var j = 0; j < chunkedArr.length; j++) {
        if (chunkedArr[j].length === chunkSize) {
            args.push(chunkedArr[j]);
        } else {
            addendum.push(chunkedArr[j]);
        }
    }

    var partialRes = zip(args);

    if (addendum.length === 0) {
        return partialRes;
    } else {
        for (var k = 0; k < addendum[0].length; k++) {
            partialRes[k].push(addendum[0][k]);
        }
        return partialRes;
    }
}

function zip(arrays) {
    temp = [];
    for (var i=0; i<arrays[0].length; i++) {
        partial = [];
        for (var j=0; j<arrays.length; j++) {
            partial.push(arrays[j][i])
        }
        temp.push(partial)
    }
    return temp
}

function equalCols(container) {
    var currentTallest,
        rows = [],
        $el,
        containerChildren = $(container).children(),
        colNumber = $(container).css('column-count');

    rows = chunk(containerChildren, colNumber);

    $(rows).each(function (index) {
        currentTallest = 0;
        $(rows[index]).each(function () {
            $el = $(this);
            $($el).height('auto');
            currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
        });
        $(rows[index]).each(function () {
            $el = $(this);
            $($el).height(currentTallest);
        });
    });
}