---
layout: post
title: JavaScript array item removal
categories:
- JavaScript
- Snippets
tags:
- array
- remove
status: publish
type: post
published: true
meta:
  _edit_last: '1'
  _revision-control: a:1:{i:0;s:8:"defaults";}
---
A common problem I run into when coding is dealing with the limited object types of a particular language.  Hopefully a yearly compilation of all these snippets can provide a script that expands languages to what they should have had in the first place.

Anyway, this little snippet enables simple removing of elements from an JavaScript array.
 {% highlight javascript %}
 Array.prototype.remove = function(item) {
    var i = this.indexOf(item);
    if (i!=-1) this.splice(i, 1);
};
{% endhighlight %}
Feel free to fork and change the associated <a href="http://jsfiddle.net/bign8/AgXbP/">fiddle</a> as you see fit.

If this helps with whatever you are working on, let me know! I am very interested in seeing what others are doing.
