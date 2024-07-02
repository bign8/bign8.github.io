docker:
	docker build -t bign8/about .
.PHONY:=docker

serve:
	docker run --rm --label=jekyll --volume=${PWD}:/srv/jekyll -it -p 4000:4000 jekyll/jekyll:4 bash -c 'gem install bundler jekyll && jekyll serve --draft --watch'
.PHONY:=serve

deploy: docker
	docker push bign8/about:latest
	ssh bign8.info -- docker pull bign8/about:latest
	ssh bign8.info -- docker service update --image=bign8/about:latest bign8_about
.PHONY: deploy
