---
layout: post
title: Javascript Array Random
categories:
- JavaScript
- Snippets
tags:
- javascript
- array
---
Another worthy one for the notebooks, the random entry of an array!

```js
Array.prototype.random = function() {
    return this[Math.floor(Math.random()*this.length)];
};
```

<!--more-->

Useful in applications that require the gathering of a random value...duhh
