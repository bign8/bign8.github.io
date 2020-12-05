---
layout: post
title:  Convergent Document Collaboration
categories:
- Patent
tags:
- collaboration
- CRDT
---
While working with Workiva, teammates and I designed and implemented a method for "Convergent Document Collaboration" using CRDTs.  After operating with success, our legal team helped us produce a patent to help protect Workiva's Intellectual Property.

* [Online Link](https://pdfpiw.uspto.gov/.piw?docid=10325014)

<!--more-->

In various implementations, a computing device: displays the document outline on the user interface; maintains, in a non-transitory computer-readable medium, a causal graph data structure representing the document outline, wherein the causal graph data structure includes a plurality of structure nodes, each structure node representing a level of the document outline; receives, via the user interface, an insertion of a new level to the document outline; in response to the insertion, defines a structure node that represents the inserted level; inserts a transition node in the causal graph data structure, wherein the transition node represents a relationship between the structure node and at least one other node of the causal graph data structure; inserts the structure node into the causal graph data structure as a child of the transition node; and updating the user interface to display the inserted level.
