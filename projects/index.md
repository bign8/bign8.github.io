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
- [submitCoin.com](http://submitCoin.com/)
- ...

-->


<div class="row">
  {% for project in site.data.projects %}{% if project.publish == true %}
  <div class="col-sm-6 col-md-4">
    <a class="thumbnail" href="/projects/{{ project.slug }}/">
      <img src="/projects/{{ project.slug }}/cover.jpg" alt="{{ project.project }}">
      <div class="caption">
        <h3>{{ project.project }}</h3><!--  <small class="pull-right">{{ project.category }}</small> -->
        <p>{{ project.description }}</p>
      </div>
    </a>
  </div>
  {% endif %}{% endfor %}
</div>
