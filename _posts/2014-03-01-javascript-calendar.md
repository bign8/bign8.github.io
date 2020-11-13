---
layout: post
title:  JavaScript Calendar
categories:
- Projects
- JavaScript
css: calendar
js: calendar
---

This simple script is derived from [jszen's blog](http://jszen.blogspot.com/2007/03/how-to-build-simple-calendar-with.html).  While he has done lots of great work, you will see my script has no use with double `for` loops.  This greatly improves the speed at which this script can execute and simplifies the algorithm substantially.  Also, I added the ability to scroll through the months, NBD.

<!--more-->

<div id="calendar"></div>

## Executing Code
```html
<div id="calendar"></div>
<script type="text/javascript">
window.onload = function() {
	new Calendar('calendar', /* month */, /* year */).draw();
};
</script>
```

## Dependencies

* [calendar.js](calendar.js)
* [calendar.css](calendar.css)
