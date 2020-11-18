customElements.define('n8-blog-calendar', class extends HTMLElement {
	constructor() {
		super();
		this.init = new Date();
		this.data = new Map(); // if we are provided a source, remember the dates!
		this.M = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

		// Set default attributes for self
		if (this.getAttribute('month') === null) this.setAttribute('month', this.init.getMonth());
		if (this.getAttribute('year') === null) this.setAttribute('year', this.init.getFullYear());

		// Setup shadow dom (styles, non-chaning elements, etc)
		const style = document.createElement('style');
		style.textContent = 'table{text-align:center}';
		style.textContent += 'table,th,td{border:1px solid rgba(0,0,0,.1)}';
		style.textContent += 'thead,.post{font-weight:800;background-color:rgba(0,0,0,.05)}';
		style.textContent += '.btn{cursor:pointer}';
		style.textContent += '.btn:hover,.post:hover{background-color:rgba(0,0,0,.2)}';
		style.textContent += 'ul{list-style-position:inside;padding:0}';

		// Create base table!
		this.table = document.createElement('table');
		let thead = this.table.createTHead();

		// Thead, Row 1
		let first = thead.insertRow();

		// Previous
		let prev = first.insertCell(); // todo: click listeners
		prev.textContent = '«';
		prev.addEventListener('click', e => this.shift(-1));
		prev.classList.add('btn');
		prev.title = 'Previous Month';

		// Title
		this.titleEle = first.insertCell();
		this.titleEle.colSpan = 5;

		// Next
		let next = first.insertCell(); // todo: click listeners
		next.addEventListener('click', e => this.shift(1));
		next.textContent = '»';
		next.classList.add('btn');
		next.title = 'Next Month';

		// Thead, Row 2, [DAYS OF THE WEEK]
		let second = thead.insertRow();
		for (const d of "SMTWTFS") second.insertCell().textContent = d;

		// Blog Posts
		this.ul = document.createElement('ul');
		this.p = document.createElement('p');

		// Attach elements to shadow dom
		this.attachShadow({mode: 'open'});
		this.shadowRoot.append(style, this.table, this.p, this.ul);

		// Trigger async load of blog post data + render!!!
		this.load(this.getAttribute('source'));
		this.render();
	}
	shift(offset) {
		let month = parseInt(this.getAttribute('month')) + offset;
		let year = parseInt(this.getAttribute('year'));
		if (month > 11) {
			month -= 12;
			year += 1;
		} else if (month < 0) {
			month += 12;
			year -= 1;
		}
		this.setAttribute('month', month);
		this.setAttribute('year', year);
		this.render(); // TODO: swap to monitoring the properties
	}
	load(source) {
		// convert from an array of events, to a Map[date => Array of events on that day]
		fetch(source).then(r => r.json()).then(data => {
			data.forEach(item => {
				let date = new Date(item.date);
				let key = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
				this.data.has(key) ? this.data.get(key).push(item) : this.data.set(key, [item]);
			});
			this.render();
		});
	}
	render() {
		// Parse the year/month attributes
		let month = parseInt(this.getAttribute('month'));
		let year = parseInt(this.getAttribute('year'));

		// Cleanup weeks from previous month
		for (const body of this.table.tBodies) body.remove();
		this.ul.innerHTML = '';
		this.p.textContent = '';

		// Update the title to be correct
		this.titleEle.textContent = `${this.M[month]} ${year}`; // TODO

		// Convert parameters into offsets, used for drawing month
		let startingDayOfWeek = new Date(year, month, 1).getDay(),
			endingDate = new Date(year, month+1, 0),
			daysInMonth = endingDate.getDate(),
			lastRow = 6 - endingDate.getDay();

		// Pad the month until the starting day
		let row = this.table.createTBody().insertRow(0);
		if ( startingDayOfWeek ) {
			let prev = row.insertCell(0);
			prev.colSpan = startingDayOfWeek;
			prev.addEventListener('click', e => this.shift(-1));
			prev.classList.add('btn');
			prev.title = 'Previous Month';
		}

		// Generate the days of the month (wrapping weeks properly)
		for (var day = 1; day <= daysInMonth; day++) {
			let cell = row.insertCell(-1);
			cell.textContent = day;
			let index = `${year}-${month}-${day}`;
			if (this.data.has(index)) {
				let events = this.data.get(index);
				cell.title = `${events.length} Post${events.length != 1?'s':''}`
				cell.classList.add('btn', 'post');
				cell.addEventListener('click', e => this.show(index));
			}
			if ( (day+startingDayOfWeek)%7 == 0 && day != daysInMonth ) row = this.table.insertRow(-1);
		}

		// Pad last week of month if there are empty days.
		if ( lastRow ) {
			let next = row.insertCell(-1);
			next.colSpan = lastRow;
			next.addEventListener('click', e => this.shift(1));
			next.classList.add('btn');
			next.title = 'Next Month';
		}
	}
	show(index) {
		let items = this.data.get(index);
		let date = new Date(items[0].date);
		date = `${this.M[date.getMonth()]}\xa0${date.getDate()},\xa0${date.getFullYear()}`;
		this.p.textContent = `Posts for ${date}`;
		this.ul.innerHTML = '';
		for (const item of items)
			this.ul.innerHTML += `<li><a href="${item.url}">${item.title}</a></li>`;
	}
});
