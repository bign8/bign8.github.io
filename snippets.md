---
layout: default
title: Snippets
permalink: /snippets/
---
<h1>Snippets</h1>

<p class="lead">Some random bits of code that I have found useful or interesting over the years; Hopefully it will be helpful for you as well.</p>

<hr/>
<section class="posts">
	{% for post in site.snippets %}<article>
		<div class="pull-right">{% for tag in post.tags %}<span class="label label-default">{{tag}}</span> {% endfor %}</div>
		<h2>
			<a href="{{ post.url }}">{{ post.title }}</a>
			{% if post.draft %}<small>DRAFT</small>{% endif %}
		</h2>
		{{ post.excerpt }}
		Published: <time class="text-muted" itemprop="datePublished" content="{{ post.date }}">{{ post.date | date: "%Y-%m-%d" }}</time>
		<a class="pull-right" href="{{ post.url }}">continue reading »</a>
	</article>
	<hr/>{% endfor %}
</section>
