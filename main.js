const empty = '<td class="dontborder"></td>',
    remove = '<td class="dontborder remove">X</td>',
    add = '<td class="dontborder add">+</td>',
    singletd =
        '<td class="score" inputmode="numeric" contenteditable></td>',
    diff = '<th class="diff"></th>';

$(document).ready(() => {
    let playerrows = $('#scores .player'),
        scorerows = $('#scores .score'),
        sums = $('#scores .sum');

    const dummy = $('#dummy');
    const ch = dummy.width('1ch').width();
    dummy.remove();

    let nrows = 1, positiveplayer = 3,
        undoObject = null;

    function updateRowObjects() {
        playerrows = $('#scores .player'),
        scorerows = $('#scores .score');
    }

    function calculateDifferenceText(row, lastDiff) {
        const positivenum = row.eq(positiveplayer).text(),
              negativenum = row.eq(5 - positiveplayer).text();
        if (!(positivenum && negativenum)) {
            return NaN;
        }
        return difference = positivenum - negativenum
            + (lastDiff == 'diff' ? 0 : +lastDiff);
    }

    function doMath(lastrow) {
        function setTextNotNaN(jQObject, text) {
            jQObject.text(isNaN(text) ? '\u00a0' : text);
        }
        let lastDiff = lastrow.children().last().text();
        lastrow.nextAll().filter(':not(#sum):not(.emptyrow)')
            .each(function () {
                const row = $(this).children(),
                    thisdiff = row.last();
                const difference = calculateDifferenceText(row, lastDiff);
                setTextNotNaN(thisdiff, difference);
                lastDiff = difference;
            });
        /*
        const sum1 = scorerows.filter(`:nth-child(${6 - positiveplayer})`)
            .map(function () {
                return $(this).text();
            }).toArray().reduce((a, b) => +a + +b, 0);
        setTextNotNaN(sums.eq(3 - positiveplayer), sum1);
        setTextNotNaN(sums.eq(positiveplayer - 2), sum1 + +lastDiff);*/
        const addFunc = (a, b) => +a + +b;
        function thistext() {
            return $(this).text();
        }
        let i = 3;
        sums.each(function () {
            setTextNotNaN($(this), scorerows.filter(`:nth-child(${i++})`)
            .map(thistext).toArray().reduce(addFunc, 0));
        });
    }

    function removeRow() {
        const row = $(this).parent();
        undoObject = {
            me: row,
            prevSibling: row.prev()
        };
        row.detach();
        updateRowObjects();
        doMath(undoObject.prevSibling);
        --nrows;
    }

    function addRowAtIdx(idx) {
        let twochildren = remove + add;
        const isNegIdx = idx < 0;
        if (isNegIdx) {
            twochildren = empty.repeat(2);
        }
        const row = scorerows.parent().eq(idx),
            elementtext =
            `\
<tr class="emptyrow">\
${twochildren}${singletd.repeat(2)}${diff}\
</tr>\
            `;
        let addedListenersRow, updatedSymbolsRow;
        if (isNegIdx) {
            row.after(elementtext);
            row.children().first().text('X').addClass('remove');
            row.children().eq(1).text('+').addClass('add');
            addedListenersRow = row.next(),
            updatedSymbolsRow = row;
            row.removeClass('emptyrow');
        } else {
            row.before(elementtext);
            addedListenersRow = row.prev(),
            updatedSymbolsRow = row.prev();
        }
        addedListenersRow.children('.score')
            .on('input', inputOnTd).focus(focusOn);
        updatedSymbolsRow.children('.remove').click(removeRow);
        updatedSymbolsRow.children('.add').click(addRow);
        updateRowObjects();
        ++nrows;
    }

    function addRow() {
        addRowAtIdx($(this).parent().index() - 1);
    }

    function updatePlayerName() {
        $('#positivename').text(
            playerrows.siblings().addBack().eq(positiveplayer).text()
        );
    }

    $('#switch').click(() => {
        positiveplayer = 5 - positiveplayer;
        updatePlayerName();
        scorerows.parent().each(function () {
            const diff = $(this).children().last();
            const prevtext = diff.text();
            diff.text(prevtext ? -prevtext : '');
        });
    });

    function swap1and2(row) {
        const temp = row.eq(3).text();
        row.eq(3).text(row.eq(2).text());
        row.eq(2).text(temp);
    }

    $('#swapnames').click(() => {
        positiveplayer = 5 - positiveplayer;
        playerrows.parent().siblings().addBack().each(function () {
            swap1and2($(this).children());
        });
    });

    $('#undo').click(() => {
        if (undoObject != null) {
            undoObject.prevSibling.after(undoObject.me);
            updateRowObjects();
            doMath(undoObject.prevSibling);
            ++nrows;
            undoObject = null;
        }
    });

    $('.remove').click(removeRow);

    playerrows.on('input', updatePlayerName).focus(focusOn)
        .trigger('input');

    $('#scores').on('input', function () {
        const w = Math.min(Math.max(...playerrows.map(function () {
            return $(this).width('fit-content')
                .css('maxWidth', '').width();
        })) + ch, 200);
        playerrows.each(function () {
            $(this).width(w).css('maxWidth', w);
        });
        scorerows.each(function () {
            $(this).css('maxWidth', w);
        });
    }).trigger('input');

    function inputOnTd() {
        doMath($(this).parent().prev());
        if ($(this).parent().index() == nrows) {
            /*const lastrow = scorerows.parent().last();
            if (lastrow.index() > 1) {
                const children = lastrow.children();
                children.first().addClass('remove').text('X');
                children.eq(1).addClass('add').text('+');
            }*/
            addRowAtIdx(-1);
        }
    }

    function focusOn() {
        const selection = document.getSelection(),
            range = document.createRange();
        range.selectNodeContents(this);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    scorerows.on('input', inputOnTd).focus(focusOn).first();
});
