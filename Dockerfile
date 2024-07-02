FROM jekyll/jekyll:4 as builder
RUN gem install bundler jekyll
RUN NOKOGIRI_USE_SYSTEM_LIBRARIES=true gem install html-proofer
ADD . /site
WORKDIR /site
RUN mkdir _site
RUN jekyll build
RUN /usr/gem/bin/htmlproofer _site --disable-external --no-enforce-https

FROM golang:1.16-alpine as go
WORKDIR /go/src
COPY --from=builder /site/_site ./_site
ADD main.go go.mod ./
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /go/bin/about -v

FROM scratch
COPY --from=go /go/bin/about /about
ENTRYPOINT ["/about"]
