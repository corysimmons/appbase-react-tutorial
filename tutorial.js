// appbase-react-app/src/components/App.js

import React, {Component} from 'react'
import Appbase from 'appbase-js'
import axios from 'axios'

// Allows us to easily sort our results in asc or desc order. https://lodash.com/docs/4.17.4#orderBy
import orderBy from 'lodash.orderby'

import Results from './Results'

// Let's use our read credentials to minimize coupling with the write credentials (which we'll be removing in a future tutorial).
const appbaseReadRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  app: 'Blog',
  credentials: 'JYPzM1j1I:26b31079-de99-4a62-86c6-28ae815397b5'
})

const appbaseWriteRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  app: 'Blog',
  credentials: 'FMLXCgtMj:db3b270b-85f2-4f3d-837b-b75cba864bd5'
})

export default class App extends Component {
  constructor() {
    super()

    this.state = {
      posts: []
    }
  }

  componentDidMount() {
    appbaseReadRef
      // Fetch up-to 1000 (maximum before you need to paginate) documents of the type 'post'.
      // http://docs.appbase.io/scalr/javascript/api-reference.html#javascript-api-reference-getting-data-search
      .search({
        type: 'post',
        size: 1000,
        body: {
          query: {
            match_all: {}
          }
        }
      })
      .on('data', res => {
        // console.log(res) // Uncomment this line to see what kind of JSON .search responds with.

        this.setState({
          // _id is a string, so we need to type-cast it to a Number.
          // orderBy is just ordering these by their _id in ASC order (smallest number first).
          posts: orderBy(res.hits.hits, o => Number(o._id), ['asc'])
        })
      })
      .on('error', err => console.error(err))

    appbaseReadRef
      // Open a stream of data from Appbase into this.state.posts
      .searchStream({
        type: 'post',
        body: {
          query: {
            match_all: {}
          }
        }
      })
      .on('data', res => {
        // console.log(res) // Uncomment this line to see what kind of JSON .searchStream responds with.

        this.setState({
          // ...this.state.posts expands to the contents of this.state.posts. So [1, 2, 3] would expand to 1, 2, 3.
          // Each item in the this.state.posts array is an object with an _id.
          // Then we wrap it in brackets to create a fresh array.
          posts: orderBy([...this.state.posts, res], o => o._id, ['asc'])
        })
      })
      .on('error', err => console.error(err))
  }

  addPostsToAppbase = e => {
    e.preventDefault()

    // Fetch dummy JSON using Axios
    axios.get('http://localhost:1337/posts')
      .then(res => {
        // Map over each post object in the response array, writing to Appbase.
        res.data.posts.map(post => {
          return appbaseWriteRef.index({
            type: 'post',
            id: post.id,
            body: {
              title: post.title,
              author: post.author,
              body: post.body
            }
          })
          .on('error', err => console.error(err))
        })
      })
      .catch(err => console.error(err))
  }

  render() {
    return (
      <div>
        <button onClick={this.addPostsToAppbase} style={{padding: 10, cursor: 'pointer'}}>Add blog posts data to Appbase</button>
        <br />
        {/* When this.state.posts changes, <Results /> will re-render (update itself with the new data). */}
        <Results posts={this.state.posts} />
      </div>
    )
  }
}
