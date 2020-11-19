docker:
	docker build -t bign8/about .
.PHONY:=docker

serve:
	docker run --rm --label=jekyll --volume=$(shell pwd):/srv/jekyll -it -p 4000:4000 jekyll/jekyll jekyll serve --watch --drafts
.PHONY:=serve

deploy: docker
	docker push bign8/about:latest
	ssh bign8.info -- docker pull bign8/about:latest
	ssh bign8.info -- docker service update --image=bign8/about:latest bign8_about
.PHONY: deploy
