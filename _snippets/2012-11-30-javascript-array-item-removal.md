---
layout: post
title: JavaScript array item removal
categories:
- JavaScript
- Snippets
tags:
- javascript
- array
---
A common problem I run into when coding is dealing with the limited object types of a particular language.  Hopefully a yearly compilation of all these snippets can provide a script that expands languages to what they should have had in the first place.


```js
 Array.prototype.remove = function(item) {
    var i = this.indexOf(item);
    if (i!=-1) this.splice(i, 1);
};
```

<!--more-->

Anyway, this little snippet enables simple removing of elements from an JavaScript array.

Feel free to fork and change the associated [fiddle](http://jsfiddle.net/bign8/AgXbP/) as you see fit.

If this helps with whatever you are working on, let me know! I am very interested in seeing what others are doing.
