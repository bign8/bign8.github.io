---
layout: default
title:  Miscellaneous
permalink: /projects/
---
# Projects

<!-- TODO: Intro lead -->

<!--

## Projects

This list is very out of date and needs to be updated!

- N<sub>8</sub>Stats
- Web-works questions for Cline
- upstream academy (purchasing system)
- sleepDiag.com
- NateCMS
- Robots Senior Project
- Small Personal Projects
- ...

-->

All my open source projects can be found over at my personal [GOGS server](https://gogs.bign8.info/bign8).

<hr>

{% for project in site.data.projects %}{% if project.publish == true %}
<div>
  <a class="thumbnail" {% if project.link %}href="{{project.link}}" target="\_blank"{% else %}href="/projects/{{ project.slug }}/"{% endif %}>
    <div class="pull-right">{% for lang in project.languages %}<span class="label label-default">{{lang}}</span> {% endfor %}</div>
    <h3 style="margin-top: 0">{{ project.project }}</h3>
    {% if project.image %}<img src="/projects/{{ project.slug }}/cover.jpg" alt="{{ project.project }}" width="50%">{% endif %}
    <p>{{ project.description }}</p>
  </a>
</div>
<hr>
{% endif %}{% endfor %}

And that's just what I can share!
Head on over to my <a href="https://github.com/bign8">GitHub page</a> for more details on these projects.
And be sure to <a href="/contact/">drop me a line</a> if it sounds like I can help your team build modern scalable web applications.
