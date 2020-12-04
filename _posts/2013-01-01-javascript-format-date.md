---
layout: post
title: JavaScript format date
categories: []
tags: []
---
[Humminbird](http://hummingbirdstats.com/) and their [helpers.js](https://github.com/mnutt/hummingbird/blob/master/public/js/helpers.js) file, where they add a simple time formatting function to their Date object.

<!--more-->

```js
Date.prototype.formattedTime = function() {
  var formattedDate = this.getHours();

  var minutes = this.getMinutes();
  if(minutes > 9) {
    formattedDate += ":" + minutes;
  } else {
    formattedDate += ":0" + minutes;
  }

  var seconds = this.getSeconds();
  if(seconds > 9) {
    formattedDate += ":" + seconds;
  } else {
    formattedDate += ":0" + seconds;
  }

  return formattedDate;
};
```

Now this is nice for simply formatting time, but I was looking for something a little more elegant; closer to [PhP's date formatting](http://php.net/manual/en/function.date.php).
I've looked around a few places and [jQuery UI has a nice option](http://api.jqueryui.com/datepicker/#utility-functions) along with [this guy's nice encapsulated design](http://blog.stevenlevithan.com/archives/date-time-format), but I'm looking for something sleeker and a little slimmer.
Currently I am [Fiddling](http://jsfiddle.net/bign8/XeRhD/) to find a better solution...

### Open tabs at last development

* [w3schools - JavaScript Date Reference](http://www.w3schools.com/jsref/jsref_obj_date.asp)
* [Flagrant Badassery - JavaScript Date Format](http://blog.stevenlevithan.com/archives/date-time-format)
* [php - date](http://php.net/manual/en/function.date.php)
* [stackoverflow - How do I use PHP to get the current year?](http://stackoverflow.com/questions/64003/how-do-i-use-php-to-get-the-current-year)
* [bign8 - JS date fiddle](http://jsfiddle.net/bign8/XeRhD/6/)
* [timeanddate - Time Zone Abbreviations](http://www.timeanddate.com/library/abbreviations/timezones/)
* [stackoverflow - get browser timezone in ASP.NET](https://stackoverflow.com/q/2853474/3220865)
<!-- * [http://techblog.procurios.nl/k/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html](http://techblog.procurios.nl/k/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html) -->
