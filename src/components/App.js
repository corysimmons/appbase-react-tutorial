import React, {Component} from 'react'
import Appbase from 'appbase-js'
import axios from 'axios'

import Results from './Results'

const appbaseReadRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  app: 'ReactOnly',
  credentials: 'VqmBAxCV6:a4aeb223-e253-4544-a4e3-9893fe102ee5'
})

const appbaseWriteRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  app: 'ReactOnly',
  credentials: 'tpuuZ8Tnh:4bd3788d-3a12-4344-a5d9-3f57acc11a2e'
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
