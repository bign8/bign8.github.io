---
layout: post
title: Go 1.23 Collection Iterator
categories:
    - golang
tags:
    - golang
    - iterators
---

What if had a standard REST API with multiple collections of items and you wanted to load them all.
Microsoft's API design guide represents this as a collection with the following response structure:

```json
{ // first page loaded from https://api.example.com/items
    "value": [
        { "id": "1", "name": "item1" },
        { "id": "2", "name": "item2" }
    ],
    "@nextLink": "https://api.example.com/items?$next=<opaque>"
}
```

Wouldn't it be nice to write a `for` loop to iterate over all the items in the collection like this?

```go
type Item struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

func fictitiousExample() {
    for item := range LoadCollection[Item]("https://api.example.com/items") {
        fmt.Println(item)
    }
}
```

With a little extra trickery, you can!

<!--more-->

TODO: some words about go 1.23 iterators

```go
package <something>

import "iter"

func LoadCollection[V any](initial string, loader func(url string, object any) error) iter.Seq2[V, error] {

    // define the structure of the list result
	type ListResult struct {
		Data []V    `json:"data"`
		Next string `json:"@nextLink"`
	}

	return func(yield func(V, error) bool) {

		// setup a single page to start
		var page ListResult
		page.Next = initial

		for page.Next != "" {

			// remember the link to load, but reset the listResult for next load
			toLoad := page.Next
			page.Next = ``
			page.Data = nil

			// load the next page
			if err := loader(toLoad, &page); err != nil {
				yield(V{}, err) // ignore the signal to continue
				return
			}

			// yield each item in the page, one at a time
			for _, v := range page.Data {
				if !yield(v, nil) {
					return
				}
			}
		}
		return
	}
}
```

And here's how you might use it:

```go
package <something>

import (
	"encoding/json"
	"net/http"
	"testing"
)

func TestLoadCollection(t *testing.T) {
	t.Skip(`// TODO: can't test until go 1.23 comes out :facepalm:`)

	type Widget struct {
		Name string `json:"name"`
	}

	for v, err := range LoadCollection[Widget]("https://example.com/widgets", func(url string, object any) error {
		// TODO: timeouts/tracing/logging/decoding errors/rate-limiting/etc
		res, err := http.Get(url)
		if err != nil {
			return err
		}
		defer res.Body.Close()
		return json.NewDecoder(res.Body).Decode(object)
	}) {
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			break
		}
		t.Logf(`widget: %#v`, v)
	}
}

```
