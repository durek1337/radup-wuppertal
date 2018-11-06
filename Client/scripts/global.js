/* Nützliche Funktionen außerhalb eines Objects */

function leadingZeroes(n,d){ // Zahl, Stellen
var r = ""+n;
var l = r.length;
for(var i=0;i<(d-l);i++) r = "0"+r;
return r;
}
function secondsToShorterUnit(s){
    var conversionArr = [60,60,24,7];
    var singleunitArr = ["Sekunde", "Minute", "Stunde", "Tag", "Woche"];
    var unitArr = ["Sekunden","Minuten","Stunden", "Tage", "Wochen"];

    var t = s;
    var i = 0;
    while(i < conversionArr.length && t >= conversionArr[i]){
        t = t / 60;
        i++;
    }
    t = Math.floor(t);
    return t+" "+((t == 1) ? singleunitArr[i] : unitArr[i]);

}
if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(nextSource);
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

function parseTimestampMySQL(str){
var matchDate = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
var parsedDate = matchDate.exec(str);
var a = new Date(parsedDate[1], parsedDate[2], parseDate[3], parseDate[4], parseDate[5], parseDate[6], 0);
return a;
}

(function() {
    var days = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];

    var months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

    Date.prototype.getMonthName = function() {
        return months[ this.getMonth() ];
    };
    Date.prototype.getDayName = function() {
        return days[ this.getDay() ];
    };
    Date.prototype.getDayLetters = function() {
        return this.getDayName().substring(0,2);
    };
    Date.prototype.getFormatedDate = function() {
        return leadingZeroes(this.getDate(),2)+"."+leadingZeroes(this.getMonth()+1,2)+"."+this.getFullYear();
    };
})();
function formArrToObj(data){
    var obj = {};
    for(var i=0;i<data.length;i++)
    if(data[i].name.length)
    obj[data[i].name] = data[i].value; // Bringe sie in die richtige Form
    return obj;
}
function getChangeObj(obj,sourceobj){ // Prüfe welche Indizes von obj zu anderen Werten von sourceobj führen und gebe das object mit den Änderungen zurück
    var updateobj = {};
    for(var i in obj)
        if(obj[i] != sourceobj[i]) updateobj[i] = obj[i];

    return updateobj;

}
function arrayToObject(arr,name){ // Verwandelt einen Array mit Daten in ein Object mit dem Attribut in name als Index
    var obj = {};
    for(var i=0;i<arr.length;i++)
        obj[arr[i][name]] = arr[i];
    return obj;
}
function deleteFromArrayByValue(arr,value){
  while (arr.indexOf(value) !== -1) arr.splice(arr.indexOf(value), 1);
  return arr;
}
function shortenString(s,l){
  if(s.length > l) return (s.substr(0,l-3)+"...")
  else return s;
}