---
layout: post
title: JavaScript Array Contains
categories:
- JavaScript
tags:
- array
- contains
---
Here is a quick one for you today.  Ever just want a simple way to see if there is an item in an array?  Well fear not, this little snippet is to the rescue!

{% highlight javascript %}
Array.prototype.contains = function(x) {
    return (this.indexOf(x) > -1);
}
{% endhighlight %}

<!--more-->

Hope this helps with any containment needs!
