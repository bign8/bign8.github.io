#!/bin/bash

# Call with directory to create a directory index for

for DIR in $(find $1 -type d); do
  (
    echo -e "<html>\n<body>\n<h1>Directory listing</h1>\n<hr/>\n<pre>"
    ls -1pa "${DIR}" | grep -v "^\.\.\?/$" | grep -v "^update\.sh$" | grep -v "^index\.html$" | awk '{ printf "<a href=\"%s\">%s</a>\n",$1,$1 }'
    echo -e "</pre>\n</body>\n</html>"
  ) > "${DIR}/index.html"
done
