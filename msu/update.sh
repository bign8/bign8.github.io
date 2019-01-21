#!/bin/bash

(
  echo -e "<html>\n<body>\n<h1>Directory listing</h1>\n<hr/>\n<pre>"
  ls -1pa | grep -v "^\.\.\?/$" | grep -v "^update\.sh$" | grep -v "^index\.html$" | awk '{ printf "<a href=\"%s\">%s</a>\n",$1,$1 }'
  echo -e "</pre>\n</body>\n</html>"
) > index.html
