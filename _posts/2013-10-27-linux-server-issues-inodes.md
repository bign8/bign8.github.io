---
layout: post
title: ! 'Linux server issues: iNodes'
categories:
- Shell
tags: []
---
When the `df`  command reports that you have plenty of disk space, yet you continue to receive several "not enough disk space" errors, your issue is probably with iNodes.  Verify this is your problem by seeing that the `df -i` command returns 100% usage on a particular drive.

For me, this usually occurs when an application creates a ton of small files in a single directory.  In order to find all these files, I started at the root with the command mentioned below and looked for the most files and drilling down and repeat.

<!--more-->

Attempt to track down culprit with this command:

```sh
for d in *; do echo -n "$d: "; sudo find $d -type f | wc -l; done
```

Once you find the culprit directory, you probably will find that removing the files with a simple `rm *` will result in a "Argument list too long error".  Circumvent these issues by using this command to erase massive amounts of files: `find . | xargs rm -Rf`
