---
layout: default
title:  JavaScript Calendar
---
<script>
function Calendar(month, year) {
	var current_date = new Date();
	this.day_labels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	this.month_labels = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	this.month = (isNaN(month) || month == null) ? current_date.getMonth() : month;
	this.year  = (isNaN(year) || year == null) ? current_date.getFullYear() : year;
	if (this.month > 11) {
		this.month -= 12;
		this.year += 1;
	} else if (this.month < 0) {
		this.month += 12;
		this.year -= 1;
	}
}
Calendar.regen = function (e, operation, month, year) {
	e.target.parentElement.parentElement.parentElement.parentElement.innerHTML = new Calendar(month + operation, year).getHTML(true);
};
Calendar.prototype.getHTML = function(noWrapper){
	var startingDay = new Date(this.year, this.month, 1).getDay();
	var monthLength = new Date(this.year, this.month + 1, 0).getDate();
	var inLastRow = ( startingDay + monthLength ) % 7;
	
	// generate header
	var html = '<table class="calendar"><tr>';
	html += '<th class="regen" onclick="Calendar.regen(event, -1, ' + this.month + ', ' + this.year + ')">&laquo;</th>'
	html += '<th colspan="5">' + this.month_labels[this.month] + "&nbsp;" + this.year + '</th>';
	html += '<th class="regen" onclick="Calendar.regen(event, +1, ' + this.month + ', ' + this.year + ')">&raquo;</th>'
	html += '</tr><tr class="header">';
	for (var i = 0; i <= 6; i++ )
		html += '<td title="' + this.day_labels[i] + '">' + this.day_labels[i].charAt() + '</td>';
	html += '</tr><tr>';

	// generate calendar
	if (startingDay > 0) html += '<td colspan="' + startingDay + '"></td>';
	for (var day = 1; day <= monthLength; day++) {
		html += '<td>' + day + '</td>';
		if ( (day + startingDay) % 7 == 0 && day != monthLength ) html += '</tr><tr>';
	}
	if ( inLastRow != 0 ) html += '<td colspan="' + ( 7 - inLastRow ) + '"></td>';
	html += '</tr></table>';

	return noWrapper ? html : ('<div>'+html+'</div>');
}
</script>
<style>
.calendar {
  font-family: Helvetica, sans-serif;
  font-size: 12px;
  text-align: center;
  width: auto;
  margin: 0 auto;
}
.calendar .regen {
  padding-top: 0; 
  -moz-user-select: none; 
  -khtml-user-select: none; 
  -webkit-user-select: none; 
  -o-user-select: none;
}
.calendar, .calendar th, .calendar td { border: 1px solid rgba(0, 0, 0, 0.1); }
.calendar th, .calendar .header { background-color: rgba(0, 0, 0, 0.02); }
.calendar td { width: 20px; }
</style>

This simple script is derived from [jszen's blog](http://jszen.blogspot.com/2007/03/how-to-build-simple-calendar-with.html).  While he has done lots of great work, you will see my script has no use with double `for` loops.  This greatly improves the speed at which this script can execute and simplifies the algorithm substantially.  Also, I added the ability to scroll through the months, NBD.

Below you can see the final result and  source code

<script type="text/javascript">document.write(new Calendar().getHTML())</script>

## Executing Code
{% highlight javascript %}
document.write(new Calendar(/* Month */, /* Year */).getHTML());
{% endhighlight %}

## Code for `Calendar.js`
{% highlight javascript %}
function Calendar(month, year) {
	var current_date = new Date();
	this.day_labels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	this.month_labels = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	this.month = (isNaN(month) || month == null) ? current_date.getMonth() : month;
	this.year  = (isNaN(year) || year == null) ? current_date.getFullYear() : year;
	if (this.month > 11) {
		this.month -= 12;
		this.year += 1;
	} else if (this.month < 0) {
		this.month += 12;
		this.year -= 1;
	}
}
Calendar.regen = function (e, operation, month, year) {
	e.target.parentElement.parentElement.parentElement.parentElement.innerHTML = new Calendar(month + operation, year).getHTML(true);
};
Calendar.prototype.getHTML = function(noWrapper){
	var startingDay = new Date(this.year, this.month, 1).getDay();
	var monthLength = new Date(this.year, this.month + 1, 0).getDate();
	var inLastRow = ( startingDay + monthLength ) % 7;
	
	// generate header
	var html = '<table class="calendar"><tr>';
	html += '<th class="regen" onclick="Calendar.regen(event, -1, ' + this.month + ', ' + this.year + ')">&laquo;</th>'
	html += '<th colspan="5">' + this.month_labels[this.month] + "&nbsp;" + this.year + '</th>';
	html += '<th class="regen" onclick="Calendar.regen(event, +1, ' + this.month + ', ' + this.year + ')">&raquo;</th>'
	html += '</tr><tr class="header">';
	for (var i = 0; i <= 6; i++ )
		html += '<td title="' + this.day_labels[i] + '">' + this.day_labels[i].charAt() + '</td>';
	html += '</tr><tr>';

	// generate calendar
	if (startingDay > 0) html += '<td colspan="' + startingDay + '"></td>';
	for (var day = 1; day <= monthLength; day++) {
		html += '<td>' + day + '</td>';
		if ( (day + startingDay) % 7 == 0 && day != monthLength ) html += '</tr><tr>';
	}
	if ( inLastRow != 0 ) html += '<td colspan="' + ( 7 - inLastRow ) + '"></td>';
	html += '</tr></table>';

	return noWrapper ? html : ('<div>'+html+'</div>');
}
{% endhighlight %}

## Code for `Calendar.css`
{% highlight css %}
.calendar {
  font-family: Helvetica, sans-serif;
  font-size: 12px;
  text-align: center;
  width: auto;
  margin: 0 auto;
}
.calendar .regen {
  padding-top: 0; 
  -moz-user-select: none; 
  -khtml-user-select: none; 
  -webkit-user-select: none; 
  -o-user-select: none;
}
.calendar, .calendar th, .calendar td { border: 1px solid rgba(0, 0, 0, 0.1); }
.calendar th, .calendar .header { background-color: rgba(0, 0, 0, 0.02); }
.calendar td { width: 20px; }
{% endhighlight %}