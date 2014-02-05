---
layout: post
title: Stop the snow - online that is!
categories:
- JavaScript
- Snippets
- Thoughts
tags:
- hack
---
Short rant with a short fix today.

**BACK-STORY:** While browsing the wonderful Internet this holiday season, I have noticed a few sites adding a particular 'Snowing' script that provides a nice and graceful snowing effect.  Unfortunately, for those of us nerds who are tab-whores, you know who you are, having a JavaScript intense process on one tab, kills the entire system by eating up valuable system resources.  Fortunately, there is a fix, as seen below!

**INSTRUCTIONS:** This method uses JavaScript injection, which consists of typing code straight into the address bar of a web browser and executing it by 'navigating' to that page.

- Copy the line of code below
- Paste this code into the address bar of a web browser  
    *Note: Google chrome strips the 'javascript:' on paste, need to type it in, sorry.*
- Sit back and relax as your processor chills from 96% usage to 22%.

{% highlight ruby %}
	javascript:snowStorm.stop();
{% endhighlight %}

**DETAILS:** This is used to stop JavaScript snow using the script entitled "DHTML Snowstorm!".  This script is available from [www.schillmania.com](http://www.schillmania.com/projects/snowstorm/ "DHTML JavaScript snow").  May I advise that when this script is used, there is an option to disable the snow, possibly setting a cookie and then have the script check if the cookie is set to disable.  This may be a small addition I add later.

### Sites using DHTML Snowstorm

- [thechivery.com](http://www.thechivery.com/ "The Chivery")
- etc...

Finally, a few more holiday javascript examples and ideas can be found at  
[http://www.jquery4u.com/javascript/10-jquery-javascript-christmas-effects/](http://www.jquery4u.com/javascript/10-jquery-javascript-christmas-effects/ "jQuery for you")
