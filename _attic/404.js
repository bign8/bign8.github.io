var N8 = N8 || {}; // Global namespace

N8.links = [
	"http://bign8.info/",
	"http://dbv.vizuina.com/",
	"https://github.com/facebook/facebook-php-sdk",
	"https://developers.facebook.com/docs/graph-api/real-time-updates/#yourcallbackserver",
	"http://www.pi-supply.com/pi-supply-switch-v1-1-code-examples/",
	"http://www.mausberrycircuits.com/pages/setup",
	"http://playground.arduino.cc/Code/AvoidDelay",
	"http://arduino.cc/en/Tutorial/BlinkWithoutDelay",
	"http://jflasher.github.io/spark-helper/",
	"http://net.tutsplus.com/tutorials/other/building-static-sites-with-jekyll/",
	"http://hadihariri.com/2013/12/24/migrating-from-wordpress-to-jekyll/",
	"http://www.kix.in/2013/06/24/jumping-on-the-jekyll-bandwagon/",
	"http://stackoverflow.com/questions/4305955/can-jekyll-act-over-css-or-js-files",
	"http://bign8.disqus.com/",
];

N8.tpl = 'Link: <a href="{link}" target="_blank">{link}</a><br/>Title: {title}<br/>Desc: {desc}<br/>Img: <img src="{img}">';

// Custom Bace Convert
N8.bc = (function () {

	var alphalbet = ('0123456789' + 'abcdefghijklmnopqrstuvwxyz' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').split(''); // JS (function name) and URL safe please!!!
	var MAX = alphalbet.length;
	var parseInt2 = function(string, radix) {
		var number = 0;
		for (var i = 0, length = string.length - 1; i < string.length; i++)  
			number += alphalbet.indexOf(string[length - i]) * Math.pow(radix, i);
		return number;
	};
	var toString2 = function(integer, radix) {
		var out = '';
		while (integer >= radix) {
			out = alphalbet[integer % radix] + out;
			integer = Math.floor(integer / radix);
		};
		return alphalbet[integer] + out;
	};
	var convert = function (number, frombase, tobase) {
		// return parseInt(number + '', frombase | 0).toString(tobase | 0); // max radix = 36
		return toString2(parseInt2(number + '', frombase | 0), tobase | 0);
	}

	return {
		convert: convert,
		MAX: MAX,
	};
})();

// JSONP helper
N8.jsonp = (function (bc) {
	if (!bc) throw "Missing N8.bc Library";

	var count = 0;
	var callbacks = {};

	var get = function(url, cb) {
		if (cb) {
			var key = 'cb_' + bc.convert( count++, 10, bc.MAX );
			callbacks[key] = function (data) {
				delete callbacks[key]; // cleanup
				cb(data);
			};
			url = url.replace('CALLBACK', 'N8.jsonp.cb.' + key);
		}

		var script = document.createElement('script');
		script.src = url;
		script.type = 'text/javascript';
		script.async = true;
		script.onload = script.remove;
		document.getElementsByTagName('body')[0].appendChild(script);
	};

	return {
		cb: callbacks,
		get: get,
	};
})(N8.bc); // manual dependency injection

// URL shortener
N8.url = (function (links, bc, jsonp) {
	var lookup = function (key) {
		var index = bc.convert( key, bc.MAX, 10 );
		if (index >= links.length || index < 0) throw "Key out of range";
		return new Promise( gather_meta.bind(undefined, index) );
	};

	var gather_meta = function (index, resolve) {
		var link = links[ index ];
		jsonp.get( 'http://anyorigin.com/get/?url=' + encodeURIComponent(link) + '&callback=CALLBACK', function (data) {
			var obj = parse_dom(data);
			obj.link = link;
			obj.img = 'http://api.webthumbnail.org?width=300&screen=1280&format=png&url=' + encodeURIComponent(link);
			resolve(obj);
		});
	};

	var parse_dom = function (data) {
		var result = {};
		var titles = /<title>([^<]*)<\/title>/gi.exec(data.contents);
		if (titles) result.title = titles[1];

		var descs = /meta content="([^"]*)" name="description"/gi.exec(data.contents);
			descs = descs || /meta name="description" content="([^"]*)"/gi.exec(data.contents);
		if (descs) result.desc = descs[1];
		return result;
	};

	return lookup;
})(N8.links, N8.bc, N8.jsonp); // manual dependency injection

String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

window.onload = function () {
	var hash = document.location.pathname.substr(1);
	try {
		// Generate page html
		if (hash.length > 0) N8.url(hash).then(function (res) {
			document.getElementById('content').innerHTML = N8.tpl.supplant(res);
		});
	} catch (e) {
		document.location = '/real-404.html';
	}
};