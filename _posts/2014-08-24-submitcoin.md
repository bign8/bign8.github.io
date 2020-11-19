---
layout: post
title: SubmitCoin
categories: [projects]
tags: [btc, startup, PHP, Angular]
---
[SubmitCoin](http://submitcoin.com) was started to enable the crypto currency community to gain the ability to spend Bitcoin easily.  Debuting at the StartUp Weekend Missoula Montana event SubmitCoin has moved forward to expand the offering and now has offices and representatives in Missoula, MT and New York City, NY.

<p class="text-center">
  <img src="/blog/2014/submitcoin.jpg" alt="SubmitCoin" title="SubmitCoin" />
</p>

<!--more-->

## Story

In March of 2014, I attended a Startup Weekend in Missoula Montana.  This event targets technical wizards and entrepreneurs alike with the goal of evolving an idea to something VCs can support in just one weekend.  Friday night is Pitch Night, where anyone with any idea for a company can get up and has 60 seconds to give their ideas elevator pitch.  Once all the ideas have been presented, the attendees choose the best ideas for the weekend.  Teams are then formed around the highest voted ideas and then, the real fun begins.

One gentleman named Brandon pitched the idea of a cryptocurrency backed credit card.  Having some history in crypto and being this was the most technically interesting pitch given, I leaped at the opportunity to help Brandon convert his idea to reality.  A few other devs also perked up at the idea, one, with extensive history with Ruby on Rails, and another with server management experience (David).  Along side the devs, a few other folks joined in the party to help with graphics, copy, legal and business planning.

Over the course of the weekend the three devs hacked away on trying to get a demo to show the "potential investors".  We got a server that was beefy enough to run rails running, the rails guy built a cron to help move funds between backend accounts, and I built the site, and card handling processes.  We had a demo by the end of pitch-night that went through syncing an account with Coinbase, and would provide a fake virtual credit card.  Not much, but it was just to get something to get funding to build the REAL SubmitCoin.

The last day of Startup weekend is when all the CEOs presented their pitches in front of the judges.  Our demo went flawlessly as we provisioned a fake credit card and transferred crypto funds from one wallet to another.  IT WORKED! what a rush! We didn't end up taking first, but a few of us decided that the idea was pretty cool and were interested in pursuing it outside the bounds of startup weekend.

Over the next few months, Brandon found some business partners in New York that were pretty big in the crypto world, that could help us hit the ground running.  David and I worked to convert everything that we faked for the demo to be real implementations talking to actual backends.

Our biggest issue was trying to find a bank that would issue pre-paid credit cards that we could implement our main-line transaction approvers on.  This probably wasn't helped by Crypto was kinda a bad word in the banking industry at the time, but hey, we were trying.  Instead, we had a work around to try and get us start, that would use digitally provisioned gift cards, that would be purchased from our corporate USD account, while simultaneously withdrawing BTC from the cardholders account at the current exchange rate.  This wasn't a great solution, but it would be enough to show it's value to VC, and get enough startup cash to actually get a credit card approver deal with a major card carrier (quoted at the time of ~10M USD).

Eventually, we got something working! On August 10th I show transitions leaving our test BTC account and entering our business account as a pre-paid gift card was provisioned!  I think I purchased a coffee mug saying "worlds best boss" and had it sent to our CEO house with the exchange.  I was head over heals that we got something working.

Driving the prototype, was the hunt for VC investors!  We had more business consultants coming in, I was taking lunch breaks on my 9-5 to handle being on business calls with these folks in my car, it was a blast.  We had it all set up.  An agreement for ~15M from a VC in NY, that just needed to see our working prototype and would sign the check.  The meeting was set for a Wednesday, and the Monday before it... PayPal announces they are going to look into crypto backed cards.  Our VC pulls out.  sigh.  I had been working days doing full time 9-5, working on my Masters degree, and working nights to put all this together.  The business folks kept trying for more VC, but the nails were in the coffin, no VC wanted to take on PayPal at the time, and the project kinda just faded away.

Overall, it was a great experience: Meeting all the folks at Startup Weekend, the thrill of getting stuff ready for VC investment (both for show and for real) by iterating on ideas, and making some friends along the way.  David and I still exchange holiday txts, and Brandon is still making is ideas a reality.  But man... why couldn't PayPal have waited 2 more days for that press release.


## Technical

The site was written in PHP and AngularJS, and built with Jekyll, grunt and had a backing cron service as well. The site managed user accounts, Oauth connections to Coinbase, provisioned cards with our pre-paid credit card provider, and accepted applications for beta testers.  Details available upon request, but the source has been asked to stay closed for legal reasons.

Technically, we

## FAQ

### What is SubmitCoin?
SubmitCoin simply acts as a mechanism to convert crypto-currencies into merchant friendly funds so that you can spend them anywhere regardless if they accept Bitcoin or not.

### How does SubmitCoin work?
That's a pretty complicated question as it is changing all of the time. See the info-graphic below for a simplified version for you.

<p class="text-center">
  <a href="/blog/2014/submitcoin-infographic.jpg">
    <img src="/blog/2014/submitcoin-infographic.jpg" alt="How SubmitCoin works" title="How SubmitCoin works"/>
  </a>
</p>

### When will it be released?
We are releasing in phases.  Our proof of concept phase is complete and the current phase (virtual cards) is in the alpha stages of testing.  Speed of release is determined by a number of factors including availability of programming, completion of testing at each phase (usability, security and efficiency) and funding.

### Why can't I just get started now?
There is still a bit of work to do to make it all ready for prime time.  However if you would like to start getting setup to use Bitcoin, [CoinBase](https://coinbase.com/?r=531b83cd2c8a747a6b00027f&utm_campaign=user-referral&src=referral-link) is a good place.
