---
layout: post
title: Pipelines Testing and Release Strategy
categories:
- class
tags:
- algorithms
- testing
- release
---

<!-- TODO: actually talk about it -->

The operating cost of modern data-centers is the primary
concern when considering “cloud” based algorithms. These
data-centers contain numerous machines that run distributed,
graph based algorithms in order to fully take advantage of
the available resources. We attempt to lower the operating
cost of such systems by leveraging the graph structure during
the testing phases of of a software release cycle. Applying
this technique involves modifying typical system hypervisors
and the ability to support a multi-staged environment. We
use the term multi-staged to concisely describe any composite environment consisting of a development environment, a
QA environment, a staging environment and the production
environment. We verified this result by running a sample
application on both architectures and measuring operating
cost of the underlying systems. Our tests confirm, for this
case, that operating costs can be reduced significantly by this
modification of data-center hypervisors.

* [Paper](/blog/2016/csci-591-pipelines.pdf)
* [Presentation](https://docs.google.com/presentation/d/1AIgGUhBbZ-Jfm434AOfpHGzrZEac23oXP9kM3rYTXUc/present)
