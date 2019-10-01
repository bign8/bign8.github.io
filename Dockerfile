FROM jekyll/jekyll:3 as builder
ADD . /site
WORKDIR /site
RUN mkdir _site
RUN jekyll build
RUN ls _site

FROM bign8/static:latest
COPY --from=builder /site/_site /data/
EXPOSE 8080
