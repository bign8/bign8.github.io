---
layout: post
title: JavaScript Repeat a string
categories:
- JavaScript
- Snippets
tags:
- javascript
- string
---
After writing writing my fair share of for-loops, I decided there must be a better way to repeat a string.  Personally, I found this solution to be very elegant and hopefully will help you as much as it helped me.

```js
String.prototype.repeat = function(n) {
     return new Array(1 + n).join(this);
}
```

<!--more-->

Sample usage: `alert("ha".repeat(5)); // hahahahaha`

[[Source](https://www.rosettacode.org/wiki/Repeat_a_string#JavaScript "Rosetta Code")]
