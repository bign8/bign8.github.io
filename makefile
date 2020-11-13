docker:
	docker build -t bign8/about .
.PHONY:=docker

serve:
	docker run --rm --label=jekyll --volume=$(shell pwd):/srv/jekyll -it -p 4000:4000 jekyll/jekyll jekyll serve --watch --drafts
.PHONY:=serve
