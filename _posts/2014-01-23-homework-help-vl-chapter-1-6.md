---
layout: post
title: Homework Help - VL Chapter 1.6
categories:
- CSCI-100
- Intro to Programming
- 2014S
tags:
- CSCI-100
- help
---
### Correct Change

1-6. Write a program to assist a cashier with determining correct change. The program should have one input, the number of cents to return to the customer. The output should be the appropriate change in quarters, dimes, nickles and pennies.

*Hint:* Consider how integer division `\` and integer remainder `Mod` can be used as part of your solution.

<!--more-->

### Hint \#1
Using integer division we can see how many times a particular coin can fit into a given amount of change.
For example if you are trying to determine how many quarters are in 37 cents.

<pre title="Compute # of quarters in change">quarters = change \ 25</pre>

Where `change = 37`.  This results in `quarters = 1`.
To solve for the remaining coins we need to find the remaining change.
We do this by finding the total value of our quarters (`quarters * 25`) and subtracting it from change.

<pre title="Update remaining change">change = change - quarters * 25</pre>

Now you just repeat the process for all the other values of coins.

Below is the full pseudo code for finding the number of quarters for a given value of `change`, printing the number of quarters and updating `change` to the remaining amount.

<pre title="Combined Code">Assign: quarters = change \ 25
Assign: change = change - quarters * 25
Output: "Quarters " & quarters</pre>


### Hint \#2

But wait, there's more!
We can simplify the above code to two lines!
For those of you who know their math, we are just finding the **integer remainder** between change and quarters, with this statement:

<pre title="This is just computing the integer remainder">change = change - quarters * 25</pre>

So we can directly replace it  the above statement with:

<pre title="Same thing, but using MOD">change = change MOD 25</pre>

Knowing this, we now don't have to store the value of quarters, just print it.
So we can reduce the three lines above to just two lines!

<pre title="A shortened solution">Output: "Quarters " &amp; (change \ 25)
Assign: change = change MOD 25</pre>

Now just repeat these two lines for dimes and nickles.  And the remaining change after those two lines?  The amount of pennies!

> Hopefully this will help you make **sense** of the **cents** problem!
