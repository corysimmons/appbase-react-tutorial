# Appbase Makes Streaming Data to React Apps Easy

[Appbase](https://appbase.io/) is streaming [ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/guide/2.x/getting-started.html) in the cloud.

It makes saving, querying, and streaming data really easy.

Today we're going to:

1. Make a _really simple_ Express endpoint to generate dummy blog post JSON data using an npm package called [casual](https://github.com/boo1ean/casual).
2. Create a React button component to import that endpoint data to Appbase. We'll use the [appbase-js](http://docs.appbase.io/scalr/javascript/api-reference.html) library for this.
3. Browse that data using the [Appbase Dashboard](https://dashboard.appbase.io/apps).
4. Create a React component auto-update a streaming list of posts from Appbase.
5. Create a React component to use ElasticSearch's [query language](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html) to search through our list of posts.
6. Sort our list of posts by their [ElasticSearch score](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html) using [lodash](https://lodash.com/).

Sounds hard, but it should come in around a few hundred lines of code using [appbase-js](http://docs.appbase.io/scalr/javascript/api-reference.html).

## 1. Express Dummy JSON Endpoint

- `mkdir dummy-data`
- `cd dummy-data`
- `yarn add express cors casual nodemon`
  - [Express](https://expressjs.com/) for URL endpoint.
  - [cors](https://github.com/expressjs/cors) so we can fetch from anywhere.
  - [casual](https://github.com/boo1ean/casual) to generate random data simply.
  - [nodemon](https://github.com/remy/nodemon) to reload our Express server anytime we make changes to it (you might want to use your own data schema).

```js
// dummy-data/index.js

const express = require('express')
const app = express()
const cors = require('cors')
const casual = require('casual')

app.use(cors())

app.get('/posts', (req, res) => {
  const data = { posts: [] }

  for (let i = 0; i < 20; i++) { // Generating 20 blog posts data.
    data.posts.push({
      id: casual.integer(1, 1000), // Random number between 1-1000. It's unlikely we'll get duplicates, and this is just for demo purposes.
      title: casual.title, // Random blog post title.
      author: casual.name, // Random blog post author name.
      body: casual.text // Random paragraph of lipsum body text.
    })
  }

  res.json(data)
})

app.listen(1337, () => console.log(`Get your posts data at: http://localhost:1337/posts`))
```

That's it. Told you it was _really simple_.

Check out [http://localhost:1337/posts](http://localhost:1337/posts) for JSON in your browser.

> Protip: Check out a side-project I'm on called [PickyJSON](https://chrome.google.com/webstore/detail/pickyjson/cdbfbhnfamigibakdbmmnihbpjldojgl) for a really nice JSON viewing experience in your browser.
