FROM jekyll/jekyll:3 as builder
RUN NOKOGIRI_USE_SYSTEM_LIBRARIES=true gem install html-proofer
ADD . /site
WORKDIR /site
RUN mkdir _site
RUN jekyll build
RUN /usr/gem/bin/htmlproofer ./_site --disable-external

FROM bign8/static:latest
COPY --from=builder /site/_site /data/
EXPOSE 8080
