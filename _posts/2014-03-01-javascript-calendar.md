---
layout: post
title:  JavaScript Calendar
categories:
- Projects
- JavaScript
tags:
- visuals
---

This simple script is derived from [jszen's blog](http://jszen.blogspot.com/2007/03/how-to-build-simple-calendar-with.html).  While he has done lots of great work, you will see my script has no use with double `for` loops.  This greatly improves the speed at which this script can execute and simplifies the algorithm substantially.  Also, I added the ability to scroll through the months, NBD.

<!--more-->

<div id="myCalendar"></div>

## Executing Code

Below you'll fine the required markup once the Library has been imported appropriately.

```html
<div id="myCalendar"></div>
<script type="text/javascript">
window.onload = function() {
	cal('myCalendar', /* month */, /* year */);
};
</script>
```

## Javascript Library

Below you'll find the source that is used to drive this calendar.

<pre id="sourcePost"></pre>
<script id="sourceScript">
function cal(ele, month, year) {
	const M = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
		D = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ');

	// Account for default case where month and year are both unset as parameters
	if (month === undefined && year === undefined) {
		let now = new Date();
		month = now.getMonth();
		year = now.getFullYear();
	}

	// Convert parameters into offsets, used for drawing month
	let startingDayOfWeek = new Date(year, month, 1).getDay(),
		endingDate = new Date(year, month+1, 0),
		daysInMonth = endingDate.getDate(),
		lastRow = 6 - endingDate.getDay();

	// Generate prev/next month button content
	let prevMonth = month-1, prevYear = year;
	if (prevMonth < 0) {
		prevMonth += 12
		prevYear -= 1;
	}
	let prevLink = `${arguments.callee.name}('${ele}', ${prevMonth}, ${prevYear})`;
	let nextMonth = month+1, nextYear = year;
	if (nextMonth > 11) {
		nextMonth -= 12;
		nextYear += 1;
	}
	let nextLink = `${arguments.callee.name}('${ele}', ${nextMonth}, ${nextYear})`;

	// Generate Header
	let html = `<table><tr>`;
	html += `<th onclick="${prevLink}" title="Past Month" class="btn">&laquo;</th>`;
	html += `<th colspan="5">${M[month]}&nbsp;${year}</th>`
	html += `<th onclick="${nextLink}" title="Next Month" class="btn">&raquo;</th>`;
	html += `</tr><tr>`;
	for (let i = 0; i < 7; i++) html += `<th title="${D[i]}">${D[i].charAt()}</th>`;
	html += `</tr><tr>`;

	// Pad the month until the starting day
	if ( startingDayOfWeek ) html += `<td colspan="${startingDayOfWeek}"></td>`;

	// Generate the days of the month (wrapping weeks properly)
	for (var day = 1; day <= daysInMonth; day++) {
		html += `<td>${day}</td>`;
		if ( (day+startingDayOfWeek)%7 == 0 && day != daysInMonth ) html += `</tr><tr>`;
	}

	// Pad last week of month if there are empty days.
	if ( lastRow ) html += '<td colspan="' + lastRow + '"></td>';
	html += `</tr></table>`;

	// Output the result
	document.getElementById(ele).innerHTML = html;
}
</script>

<script>
// helping logic to display this post
window.onload = function() {
	cal('myCalendar')
	sourcePost.innerText = sourceScript.innerText.trim()
};
</script>

*Edit 2020-11-14 - Reworked to use FETCH api and removed directly embedded source files*  
*Edit 2021-06-27 - Moved to site CSS, and Embedded JS (yolo)*  
