---
layout: post
title:  Causal Graph CRDT
categories:
- publication
tags:
- collaboration
- CRDT
---
While working with Workiva, teammates and I designed and implemented a method for "Convergent Document Collaboration" using CRDTs.  After operating with success, Workiva [patented the algorithm](/blog/2018/convergent-document-collaboration.html) and published our paper to the ACM.

* [Conference](https://doceng.org/doceng2018)
* [ACM Paper](https://dl.acm.org/doi/abs/10.1145/3209280.3229110)

<!--more-->

Commutative Replicated Data Types (CRDTs) are an emerging tool for real-time collaborative editing. Existing work on CRDTs mostly focuses on documents as a list of text content, but large documents (having over 7,000 pages) with complex sectional structure need higher-level organization. We introduce the Causal Graph, which extends the Causal Tree CRDT into a graph of nodes and transitions to represent ordered trees. This data structure is useful in driving document outlines for large collaborative documents, resolving structures with over 100,000 sections in less than a second.
