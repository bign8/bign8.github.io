var x;
try {
function Calendar(ele, month, year) {
	var current_date = new Date();
	this.day_labels = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	this.month_labels = ['January','February','March','April','May','June','July','August','September','October','November','December'];

	// clean auto incremented numbers
	if (month > 11) {
		month -= 12;
		year += 1;
	} else if (month < 0) {
		month += 12;
		year -= 1;
	}

	// store some stuff
	this.ele = ele;
	this.month = (isNaN(month) || month == null) ? current_date.getMonth() : month;
	this.year  = (isNaN(year) || year == null) ? current_date.getFullYear() : year;
};
Calendar.prototype.draw = function () {
	this.getHTML();
	document.getElementById(this.ele.trim()).innerHTML = this.getHTML();
};
Calendar.prototype.getHTML = function(){
	var startingDay = new Date(this.year, this.month, 1).getDay();
	var endingDate = new Date(this.year, this.month + 1, 0);
	var monthLength = endingDate.getDate();
	var inLastRow = 6 - endingDate.getDay();
	
	// generate header
	var html = '<table class="calendar"><tr>';
	html += '<th class="regen" onclick="new Calendar(\'' + this.ele + '\', ' + (this.month-1) + ', ' + this.year + ').draw();">&laquo;</th>'
	html += '<th colspan="5">' + this.month_labels[this.month] + "&nbsp;" + this.year + '</th>';
	html += '<th class="regen" onclick="new Calendar(\'' + this.ele + '\', ' + (this.month+1) + ', ' + this.year + ').draw();">&raquo;</th>'
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
	if ( inLastRow != 0 ) html += '<td colspan="' + inLastRow + '"></td>';
	html += '</tr></table>';

	return html;
};
} catch (e) {
	console.log(e);
}