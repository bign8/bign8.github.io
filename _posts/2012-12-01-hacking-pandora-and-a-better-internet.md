---
layout: post
title: Hacking Pandora and a better internet
categories:
- JavaScript
- Snippets
- Thoughts
tags:
- hack
- jQuery
---

Ads and that stupid 'Are you still listening' button are constant annoyances while trying to enjoy the wonderful custom playlists.  Both of which are removable, just don't talk to loud or they will figure something out to make this difficult (note the absence of links to Pandora from this article).  Note: these instructions are meant for [Google Chrome](http://www.google.com/chrome), clearly a superior browser, but that's another story.

<!--more-->

<div class="pull-right" style="margin-left:30px">
	<img alt="Pandora Internet Radio" src="pandora.jpg" width="212" height="132" />
	Pandora Internet Radio
</div>

## Removing Ads
This process works for all advertisements including YouTube's  not just Pandora's, which, if I am not mistaken, makes browsing the web a better experience.  This task is simply accomplished by installing an ad-blocker plugin for Chrome.  My ad-blocker of choice is [Simple Adblock](https://chrome.google.com/webstore/detail/nhfjefnfnmmnkcckbjjcganphignempo) which is developed by [wips.com](http://www.wips.com).  Simply add the extension to Chrome and reload the browser.  This single plugin has successfully improved my browsing experience by a bazillion, no big deal.

*Note: Occasionally, when an audio ad is blocked, Pandora likes to play silence for the duration of the would-be ad.  Still better than an annoying voice trying to sell you something in my book.*

## I AM STILL LISTENING!
This one requires a little more technological knowledge  but hopefully I can walk you through, nice and slow so we can all enjoy beautiful uninterrupted music.  This process involves a process called JavaScript injection, but don't be afraid of the name, Chrome Developer Tools greatly simplifies this implementation.

- Once Pandora is loaded in Chrome, press F12 on your keyboard to bring up Chrome Developer Tools (alternatively, right-clicking anywhere on the page and clicking 'inspect element' should also summon this wonderful Chrome creation).
- Along the top is a list of different operating tabs (Elements, Resources, Network...), among them should be a tab called 'Console', select it.  This tab give direct access to the page's JavaScript interface.
- Simply copy the code below and paste into the console and press return.
<pre lang="javascript" title="Fix Pandora's Still Listening Button">var panFix = setInterval(function(){
    var obj = $('.still_listening');
    if (obj.length &gt; 0) obj.click();
}, 10000);</pre>
*Explanation:* After some looking, I found that one, jQuery is loaded and two the still listening link has a unique class applied to it.  Using this, every 10 seconds, I simply check to see if the link is there and if it is, click it.
- Sit back and relax while Pandora plays forever.
- If you wish to remove this script, simply enter the following into the console and press return.
<pre lang="javascript" title="Re-enabling Pandora's Still Listening button">clearInterval(panFix);</pre>
**Explanation**: This code clears the setInterval looping function set above.

## Closing Notes
This is not recommended as these precautions are put in place to allow Pandora to be a profitable company and sustain cheap deals with the artists along with reducing needless server load.
