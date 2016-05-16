---
layout: post
title: JavaScript array sum and average
categories:
- javascript
- snippets
tags:
- array
- average
- mean
- sum
---
I can't take credit from this one, but I think the guys at [Hummingbird](http://hummingbirdstats.com/ "Hummingbird") had something right with their recursive sum function for arrays.  This function simply sums the numbers in an array.

```js
Array.prototype.sum = function() {
  return (! this.length) ? 0 : this.slice(1).sum() +
    ((typeof this[0] == 'number') ? this[0] : 0);
};
```

<!--more-->

Additionally, it may also be in order to provide an average function to compute the mean of an array.

{% highlight javascript %}
Array.prototype.average = function() {
  return (!this.length) ? undefined : (this.sum()/this.length);
};
{% endhighlight %}

*Note: while sum accounts for array entries that are not numbers, mean does not.  This is simply because it requires the count of numbers in an array.*

Finally, I attempted to implement standard deviation, but since there is a difference between population and sample standard deviations, I decided to leave that challenge for a later date.
