#! /bin/bash -ex

rm -rf _site about.gz

docker run --rm --volume=$(pwd):/srv/jekyll -it jekyll/jekyll:4 jekyll build --quiet
go build -o about -v -ldflags="-w -s" .
gzip about
scp about.gz me.bign8.info:/opt/bign8
ssh me.bign8.info -- sudo systemctl restart about

rm -rf _site about.gz
