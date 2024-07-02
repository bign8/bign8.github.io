---
layout: post
title: JavaScript Array Contains
categories:
- JavaScript
tags:
- javascript
- array
---
Here is a quick one for you today.  Ever just want a simple way to see if there is an item in an array?  Well fear not, this little snippet is to the rescue!


```js
Array.prototype.contains = function(x) {
    return (this.indexOf(x) > -1);
}
```

<!--more-->

Hope this helps with any containment needs!
