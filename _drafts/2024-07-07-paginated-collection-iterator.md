---
layout: post
title: Go 1.23 Paginated Collection Iterator
categories:
    - golang
tags:
    - golang
    - iterators
---

What if had a standard REST API with multiple collections of items and you wanted to load them all?

[Microsoft's API design guide](https://github.com/microsoft/api-guidelines/blob/vNext/graph/Guidelines-deprecated.md#94-big-collections) represents paginated collections with the following structure:

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

With go 1.23, we'll have the `iter` package that defines the `Seq` and `Seq2` types to allow custom iterators.
Using these types, we can define a function that loads a collection of items from a REST API and iterates over them.
The end result is a function that can be used in a `for` loop to load and iterate over all the items in the paginated collection.

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

`LoadCollection` is a function that takes a URL and a loader function that knows how to load the data from the URL.
The loader function is responsible for making the HTTP request and decoding the response into the `object` parameter.

There are a few things to note about this code:

- The `LoadCollection` function is generic, meaning it can work with any type of data.
- The `ListResult` struct is used to represent the response from the API.
- Returning a `iter.Seq2[V, error]` allows the errors from the loader to be handled within the loop (instead of in `LoadCollection` or the `loader` itself).

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
