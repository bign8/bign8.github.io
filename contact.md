---
layout: default
title:  Contact Me
permalink: /contact/
---
# Contact Me

<ul class="contacts clear">
{% for contact in site.data.contacts %}
	<li>
		<a href="{{ contact.link }}">
			<img src="/img/{{ contact.slug }}-128-black.png" title="{{ contact.name }}">
		</a>
	</li>
{% endfor %}
</ul>

### More?

- [CS Tutoring Center](http://www.cstutoringcenter.com/profile.php?id=2399)
- [Hack This Site](https://www.hackthissite.org/user/view/bignatew/)
- [Prezi](http://prezi.com/user/bign8)