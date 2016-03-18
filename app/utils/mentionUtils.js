export function countArrayOccurences(array, check) {
  var count = 0;
  for(var i = 0; i < array.length; ++i){
    if(array[i] == check)
    count++;
  }
  return count;
}

export var titleMentionAlert = (function () {
    var oldTitle = document.title;
    var msg = "New mention!";
    var timeoutId;
    var blink = function() { document.title = document.title == msg ? ' ' : msg; };
    var clear = function() {
        clearInterval(timeoutId);
        document.title = oldTitle;
        window.onmousemove = null;
        timeoutId = null;
    };
    return function () {
        if (!timeoutId) {
            timeoutId = setInterval(blink, 1000);
            window.onmousemove = clear;
        }
    };
}());
