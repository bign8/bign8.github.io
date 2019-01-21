FROM jekyll/jekyll:builder as builder
ADD . /site
WORKDIR /site
RUN mkdir _site
RUN jekyll build

FROM bign8/static:latest
COPY --from=builder /site/_site /data/
EXPOSE 8080
