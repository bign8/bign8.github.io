/*****************************************************************************/
/*
/* Calendar
/*
/*****************************************************************************/

function Calendar(ele, month, year) {
	this.current_date = new Date();
	this.ele = ele;
	this.setDate(month, year);
	this.day_labels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	this.month_labels = ['January','February','March','April','May','June','July','August','September','October','November','December'];
};
Calendar.data = {};
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
	document.getElementById( this.ele ).innerHTML = this.getHTML();
};
Calendar.prototype.getHTML = function(){
	var startingDay = new Date(this.year, this.month, 1).getDay();
	var endingDate = new Date(this.year, this.month + 1, 0);
	var monthLength = endingDate.getDate();
	var inLastRow = 6 - endingDate.getDay();
	var nextLink = ' class="cbtn" onclick="new Calendar(\'' + this.ele + '\', ' + (this.month+1) + ', ' + this.year + ').draw();" title="Next Month"';
	var pastLink = ' class="cbtn" onclick="new Calendar(\'' + this.ele + '\', ' + (this.month-1) + ', ' + this.year + ').draw();" title="Past Month"';
	
	// generate header
	var html = '<table class="calendar"><tr>';
	html += '<th' + pastLink + '>&laquo;</th>'
	html += '<th colspan="5">' + this.month_labels[this.month] + "&nbsp;" + this.year + '</th>';
	html += '<th' + nextLink + '>&raquo;</th>'
	html += '</tr><tr class="header">';
	for (var i = 0; i <= 6; i++ )
		html += '<td title="' + this.day_labels[i] + '">' + this.day_labels[i].charAt() + '</td>';
	html += '</tr><tr>';

	// generate calendar
	if ( startingDay ) html += '<td colspan="' + startingDay + '"' + pastLink + '></td>';
	var index, has;
	for (var day = 1; day <= monthLength; day++) {
		index = this.year + '-' + this.month + '-' + day ;
		has = Calendar.data.hasOwnProperty( index ) ? ' class="has" onclick="Calendar.showPost(\'' + this.ele + '\', \'' + index + '\')" ' : '' ;
		html += '<td' + has + '>' + day + '</td>';
		if ( (day + startingDay) % 7 == 0 && day != monthLength ) html += '</tr><tr>';
	}
	if ( inLastRow ) html += '<td colspan="' + inLastRow + '"' + nextLink + '></td>';
	return html + '</tr></table>';
};
Calendar.prototype.fetch = function(url) {
	var that = this;
	var xmlhttp = ( window.XMLHttpRequest ) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP") ;
	xmlhttp.onreadystatechange=function() {
		if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
			var data = JSON.parse( xmlhttp.responseText ), curr, index;
			for (var i = 0; i < data.length; i++) {
				curr = new Date(data[i].date);
				index = curr.getFullYear() + '-' + curr.getMonth() + '-' + curr.getDate();
				if ( Calendar.data.hasOwnProperty( index ) )
					Calendar.data[index].push( data[i] );
				else
					Calendar.data[index] = [ data[i] ];
			};
			that.draw();
		}
	};
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
};
Calendar.showPost = function(ele, index) {
	function getPostPreview() {
		var html = '<ul class="posts">', data = Calendar.data[index];
		for (var i = 0; i < data.length; i++)
			html += '<li><a href="' + data[i].url + '">' + data[i].title + '</a></li>';
		return '<h3>Posts for ' + data[0].date + '</h3>' + html + '</ul>';
	}
	element = document.getElementById(ele);
	if ( element.innerHTML.indexOf('calendar-post-detail') > -1 ) {
		document.getElementById('calendar-post-detail').innerHTML = getPostPreview();
	} else {
		element.innerHTML += '<div id="calendar-post-detail">' + getPostPreview() + '</div>';
	}
};
console.log('here');
window.onload = function() {
	var cal = new Calendar('calendar');
	cal.fetch('/misc/site.json');
	cal.draw();
};