---
layout: post
title: Make your own Linux commands!
categories:
- Shell
- Snippets
tags: []
---
Have you ever wished there was a short Linux command for several lengthy piped commands, or even a script, that is often used? (Of course you have, lets be honest here!) Fortunately for you, there are two ways to do such a thing.

<!--more-->

- Create a command alias
- Move a script to the `/usr/bin` directory

Either way, it would likely be a good idea to have administrative permissions. (Though not required in all cases)


## Alias
For smaller/simpler commands, it is possible to simply create an alias. Using the alias command, Linux users can create a symbolic name for any desired shell code.

```sh
> alias newCommandName='complicated | command < code >> here.sh'
```

For example, a command I like to use often is a [Load Average](https://en.wikipedia.org/wiki/Load_(computing) "Wikipedia's thoughts on Load Average") command. This command shows processor usage for the past 1 minute, 5 minutes, and 15 minutes.

```sh
> cat /proc/loadavg | cut -d" " -f1-3
0.10 0.20 0.30
```

To create an alias of this command simply wrap the command in quotes and follow the syntax for the alias command.  Here I create an alias command: `la`.

```sh
> alias la='cat /proc/loadavg | cut -d" " -f1-3'
```

To view the code behind an alias, use the alias command followed by the alias name.

```sh
> alias la
```

To remove an alias of a command, simply use the unalias command.

```sh
> unalias la
```

[[Source](http://www.mediacollege.com/linux/command/alias.html "Media College on Alias Command")]

## Move script to `/usr/bin`
As commands become more complicated, possibly creating variables and using them later, it may become more convent to move these commands to a shell script. Note: these instructions also allow for any script to become a short command.

Create a file with the commands desired in it. (Back to the Load Average example)

```sh
> vi la
```

```sh
#! /bin/bash
cat /proc/loadavg | cut -d' ' -f1-3
```

Add permission to execute file.

```sh
> chmod +x la
```

Test if script is working

```sh
> ./la
0.11 0.21 0.31
```

Finally, move to `/usr/bin`

```sh
> move la /usr/bin/la
```

With that, your new la command should be ready to use, from anywhere.

[[Source](http://en.kioskea.net/faq/2540-linux-create-your-own-command "Kioskea on Create Your Own Command")]

Now go forth, populate your systems with short aliases for complicated command sets and short names for long scripts.  Enjoy!
