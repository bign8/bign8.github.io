---
layout: post
title: Array JavaScript random
categories:
- JavaScript
- Snippets
tags:
- array
- random
---
Another worthy one for the notebooks, the random entry of an array!

{% highlight javascript %}
Array.prototype.random = function() {
    return this[Math.floor(Math.random()*this.length)];
};
{% endhighlight %}

Useful in applications that require the gathering of a random value...duhh
