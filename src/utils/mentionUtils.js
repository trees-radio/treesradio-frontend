export function countArrayOccurences(array, check) {
  var count = 0;
  array.forEach(item => {
    if ( item == check ) count++;
  });
  
  return count;
}

export var titleMentionAlert = (function() {
  var oldTitle = document.title;
  var msg = "New mention!";
  var timeoutId;
  var blink = function() {
    document.title = document.title == msg ? " " : msg;
  };
  var clear = function() {
    clearInterval(timeoutId);
    document.title = oldTitle;
    window.onmousemove = null;
    timeoutId = null;
  };
  return function() {
    if (!timeoutId) {
      timeoutId = setInterval(blink, 1000);
      window.onmousemove = clear;
    }
  };
})();

export var mentionTotaler = (function() {
  var timeoutId;
  var clear = function(callback) {
    clearInterval(timeoutId);
    window.onmousemove = null;
    timeoutId = null;
    if (callback) {
      callback();
    }
  };
  return function(callback) {
    if (!timeoutId) {
      timeoutId = true;
      window.onmousemove = clear.bind(this, callback);
    }
  };
})();
