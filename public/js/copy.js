var copy = (function () {
  function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
      element.focus();

      selectedText = element.value;
    } else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
      element.focus();
      element.setSelectionRange(0, element.value.length);

      selectedText = element.value;
    } else {
      if (element.hasAttribute('contenteditable')) {
        element.focus();
      }

      var selection = window.getSelection();
      var range = document.createRange();

      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);

      selectedText = selection.toString();
    }

    return selectedText;
  }

  var isRTL = false;

  function copy(text) {
    var fakeElem = document.createElement('textarea');
    // Prevent zooming on iOS
    fakeElem.style.fontSize = '12pt';
    // Reset box model
    fakeElem.style.border = '0';
    fakeElem.style.padding = '0';
    fakeElem.style.margin = '0';
    // Move element out of screen horizontally
    fakeElem.style.position = 'absolute';
    fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
    // Move element to the same position vertically
    var yPosition = window.pageYOffset || document.documentElement.scrollTop;
    fakeElem.addEventListener('focus', window.scrollTo(0, yPosition));
    fakeElem.style.top = yPosition + 'px';

    fakeElem.setAttribute('readonly', '');
    fakeElem.value = text;

    document.body.appendChild(fakeElem);

    selectedText = select(fakeElem);
    try {
      return document.execCommand('copy');
    } catch (err) {}

    return false;
  }

  return copy;
})();
