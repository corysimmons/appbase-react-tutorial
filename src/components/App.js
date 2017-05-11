import React, {Component} from 'react'
import Appbase from 'appbase-js'
import axios from 'axios'

import Results from './Results'

const appbaseReadRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  app: 'ReactOnly',
  credentials: 'O48yjLIak:56f58122-a532-4e43-a1c3-b7e39684c23f'
})

const appbaseWriteRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  app: 'ReactOnly',
  credentials: 'vxNZHX0bZ:bee764d9-1042-4097-838c-82c3798e5b5e'
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
        this.setState({
          posts: res.hits.hits
        })
      })
      .on('error', err => console.error(err))

    appbaseReadRef
      .searchStream({
        type: 'post',
        body: {
          query: {
            match_all: {}
          }
        }
      })
      .on('data', res => {
        this.setState({
          posts: [res, ...this.state.posts]
        })
      })
      .on('error', err => console.error(err))
  }

  addPostsToAppbase = e => {
    e.preventDefault()

    // Fetch dummy JSON using Axios
    axios.get('https://jsonplaceholder.typicode.com/posts')
      .then(res => {
        // Map over each post in the response array, writing to Appbase.
        res.data.map(post => {
          return appbaseWriteRef.index({
            type: 'post',
            id: Math.random(),
            body: {
              title: post.title,
              authorId: post.userId,
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
        <button onClick={this.addPostsToAppbase}>Add 100 blog posts to Appbase</button>
        <br />
        <Results posts={this.state.posts} />
      </div>
    )
  }
}
