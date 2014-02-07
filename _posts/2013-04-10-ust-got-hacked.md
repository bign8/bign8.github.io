---
layout: post
title: Just got hacked + linux search
categories:
- Shell
- Snippets
- Thoughts
tags:
- hack
- why?
---
That was fun! Turns out somebody exploited two of my WordPress Plugins, which have now been restored or deleted.

![Screenshot of nathanjwoods.com when it was hacked](/assets/img/hacked.jpg "Screenshot of nathanjwoods.com when it was hacked")

This hack was luckily, mostly unsuccessful since the hacker(s) were script kiddies and couldn't figure out how to make [nsTView](https://github.com/nikicat/web-malware-collection/blob/master/Backdoors/PHP/nstview.txt "Really Folks, please try a little harder!") work on this system, rendering its remote management capabilities useless.  To be fair, they needed some smarts to navigate the WordPress system, but I have a feeling they just attacked with an auto-hacking script.

Finding the infected the files was the most interesting part which leads me to a nice little snippet to share.  This unix/linux command searches for files that contain a particular string, now this takes a while to execute, but sure helped me to find this infected file fast.

{% highlight sh %}
	sudo find -type f -exec grep -n "nsTView" {} \; -print 2>/dev/null
{% endhighlight %}

I won't go into specifics on how it works, but by replacing nsTView with whatever string your looking for in you navigated directory, it should return some note-worthy results.

To completely remove the infected files, I went to the server and changed the name of the files and cleared/fixed their contents.  Easy enough, and now the site is back up and running.  Hopefully they try again and we can start a little hacking battle!  Especially now that I found a whole [library](https://github.com/nikicat/web-malware-collection "MooHAHAA (evil laugh)") of attacks to hit them back with.
