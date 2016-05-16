---
layout: post
title:  JavaScript Calendar
categories:
- Projects
- JavaScript
css: calendar
---

This simple script is derived from [jszen's blog](http://jszen.blogspot.com/2007/03/how-to-build-simple-calendar-with.html).  While he has done lots of great work, you will see my script has no use with double `for` loops.  This greatly improves the speed at which this script can execute and simplifies the algorithm substantially.  Also, I added the ability to scroll through the months, NBD.

<!--more-->

Below you can see the final result and  source code

<script>
function Calendar(ele, month, year) {
	this.current_date = new Date();
	this.ele = ele;
	this.setDate(month, year);
	this.day_labels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	this.month_labels = ['January','February','March','April','May','June','July','August','September','October','November','December'];
};
Calendar.prototype.setDate = function(month, year) {
	if (month > 11) {
		month -= 12;
		year += 1;
	} else if (month < 0) {
		month += 12;
		year -= 1;
	}
	this.month = (isNaN(month) || month == null) ? this.current_date.getMonth() : month;
	this.year  = (isNaN(year) || year == null) ? this.current_date.getFullYear() : year;
};
Calendar.prototype.draw = function () {
	document.getElementById(this.ele).innerHTML = this.getHTML();
};
Calendar.prototype.getHTML = function(){
	var startingDay = new Date(this.year, this.month, 1).getDay();
	var endingDate = new Date(this.year, this.month + 1, 0);
	var monthLength = endingDate.getDate();
	var inLastRow = 6 - endingDate.getDay();
	
	// generate header
	var html = '<table class="calendar"><tr>';
	html += '<th class="cbtn" onclick="new Calendar(\'' + this.ele + '\', ' + (this.month-1) + ', ' + this.year + ').draw();">&laquo;</th>'
	html += '<th colspan="5">' + this.month_labels[this.month] + "&nbsp;" + this.year + '</th>';
	html += '<th class="cbtn" onclick="new Calendar(\'' + this.ele + '\', ' + (this.month+1) + ', ' + this.year + ').draw();">&raquo;</th>'
	html += '</tr><tr class="header">';
	for (var i = 0; i <= 6; i++ )
		html += '<td title="' + this.day_labels[i] + '">' + this.day_labels[i].charAt() + '</td>';
	html += '</tr><tr>';

	// generate calendar
	if ( startingDay ) html += '<td colspan="' + startingDay + '"></td>';
	for (var day = 1; day <= monthLength; day++) {
		html += '<td>' + day + '</td>';
		if ( (day + startingDay) % 7 == 0 && day != monthLength ) html += '</tr><tr>';
	}
	if ( inLastRow ) html += '<td colspan="' + inLastRow + '"></td>';
	return html + '</tr></table>';
};
</script>

<div id="calendar"></div>
<script type="text/javascript">window.onload = function() { new Calendar('calendar').draw(); };</script>

## Executing Code
```html
<div id="calendar"></div>
<script type="text/javascript">
window.onload = function() {
	new Calendar('calendar', /* month */, /* year */).draw();
};
</script>;
```

## Code for `Calendar.js`
```js
function Calendar(ele, month, year) {
	this.current_date = new Date();
	this.ele = ele;
	this.setDate(month, year);
	this.day_labels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	this.month_labels = ['January','February','March','April','May','June','July','August','September','October','November','December'];
};
Calendar.prototype.setDate = function(month, year) {
	if (month > 11) {
		month -= 12;
		year += 1;
	} else if (month < 0) {
		month += 12;
		year -= 1;
	}
	this.month = (isNaN(month) || month == null) ? this.current_date.getMonth() : month;
	this.year  = (isNaN(year) || year == null) ? this.current_date.getFullYear() : year;
};
Calendar.prototype.draw = function () {
	document.getElementById(this.ele).innerHTML = this.getHTML();
};
Calendar.prototype.getHTML = function(){
	var startingDay = new Date(this.year, this.month, 1).getDay();
	var endingDate = new Date(this.year, this.month + 1, 0);
	var monthLength = endingDate.getDate();
	var inLastRow = 6 - endingDate.getDay();
	
	// generate header
	var html = '<table class="calendar"><tr>';
	html += '<th class="btn" onclick="new Calendar(\'' + this.ele + '\', ' + (this.month-1) + ', ' + this.year + ').draw();">&laquo;</th>'
	html += '<th colspan="5">' + this.month_labels[this.month] + "&nbsp;" + this.year + '</th>';
	html += '<th class="btn" onclick="new Calendar(\'' + this.ele + '\', ' + (this.month+1) + ', ' + this.year + ').draw();">&raquo;</th>'
	html += '</tr><tr class="header">';
	for (var i = 0; i <= 6; i++ )
		html += '<td title="' + this.day_labels[i] + '">' + this.day_labels[i].charAt() + '</td>';
	html += '</tr><tr>';

	// generate calendar
	if ( startingDay ) html += '<td colspan="' + startingDay + '"></td>';
	for (var day = 1; day <= monthLength; day++) {
		html += '<td>' + day + '</td>';
		if ( (day + startingDay) % 7 == 0 && day != monthLength ) html += '</tr><tr>';
	}
	if ( inLastRow ) html += '<td colspan="' + inLastRow + '"></td>';
	return html + '</tr></table>';
};
```

## Code for `Calendar.css`
```css
.calendar {
  font-family: Helvetica, sans-serif;
  font-size: 12px;
  text-align: center;
  width: auto;
  margin: 0 auto;
}
.calendar .btn {
  padding-top: 0; 
  -moz-user-select: none; 
  -khtml-user-select: none; 
  -webkit-user-select: none; 
  -o-user-select: none;
}
.calendar .btn:hover {
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
.calendar, .calendar th, .calendar td { border: 1px solid rgba(0, 0, 0, 0.1); }
.calendar th, .calendar .header { background-color: rgba(0, 0, 0, 0.02); }
.calendar td { width: 20px; }
```