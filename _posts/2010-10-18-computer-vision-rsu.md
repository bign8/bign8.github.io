---
layout: post
title: Computer Vision RSU
categories:
- class
tags:
- artificial intelligence
---

This summer, I researched license plate recognition, or more specifically, license plate localization. The process of license plate recognition consists of two main parts. With an input of a live video feed or static pictures, first find a license plate in the picture (license plate localization) then convert the sub-image to plain text. My work is based off of Shen-Zheng Wang and His-Jian Lee's work in [A cascade Framework for a Real-Time Statistical Plate Recognition System](https://ieeexplore.ieee.org/document/4202577). The main focus of their work was to grab as many possible license plates in a picture and eliminate possibilities later using properties of a license plate and conditions of surrounding areas of license plate.

<!--more-->

## Results
I proposed an algorithm that uses a searching technique to find concurent columns in pictures in order to find a license plate. This searching technique looks for similar sized parallel and vertical lines in a similar region on an image that has been processed to exaggerate vertical changes. More in depth results can be found in my [final presentation](FinalPresentation.pdf) or [final project](FinalPaper.pdf).

<img src="demo1.jpg" alt="Example 1" class="col" />
<img src="demo2.jpg" alt="Example 2" class="col"/>
<img src="demo3.jpg" alt="Example 3" class="col"/>

<style>
img.col {display:inline-block;width:33%}
</style>

## Links

* [RSU Website](https://cs.usu.edu/people/XiaojunQi/Teaching/REU10/)
* [Student Website](https://cs.usu.edu/people/XiaojunQi/Teaching/REU10/Website/Nathan/nwoods.html)
