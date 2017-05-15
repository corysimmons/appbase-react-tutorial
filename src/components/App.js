import React, {Component} from 'react'
import Appbase from 'appbase-js'
import axios from 'axios'
import orderBy from 'lodash.orderby'

import Results from './Results'

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
      posts: [],
      searchQuery: ''
    }
  }

  fetchPosts = () => {
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
          posts: orderBy(res.hits.hits, o => Number(o._id), ['asc'])
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
          posts: orderBy([...this.state.posts, res], o => Number(o._id), ['asc'])
        })
      })
      .on('error', err => console.error(err))
  }

  componentDidMount() {
    this.fetchPosts()
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

  handleChange = e => {
    e.preventDefault()

    this.setState({
      searchQuery: e.target.value
    })

    if (this.state.searchQuery !== '') {
      appbaseReadRef
        .search({
          type: 'post',
          size: 1000,
          body: {
            query: {
              bool: {
                must: [
                  {
                    match: {
                      title: this.state.searchQuery
                    }
                  }
                ]
              },
              minimum_should_match: 1
            }
          }
        })
        .on('data', res => {
          this.setState({
            posts: orderBy(res.hits.hits, o => Number(o._id), ['asc'])
          })
        })
        .on('error', err => console.error(err))

      appbaseReadRef
        .searchStream({
          type: 'post',
          body: {
            query: {
              bool: {
                must: [
                  {
                    match: {
                      title: this.state.searchQuery
                    }
                  }
                ],
                minimum_should_match: 1
              }
            }
          }
        })
        .on('data', res => {
          this.setState({
            posts: orderBy([...this.state.posts, res], o => Number(o._id), ['asc'])
          })
        })
        .on('error', err => console.error(err))
    } else {
      this.fetchPosts()
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.addPostsToAppbase} style={{padding: 10, cursor: 'pointer'}}>Add blog posts data to Appbase</button>
        <br />
        <input type="text" onChange={e => this.handleChange(e)} defaultValue={this.state.searchQuery} placeholder="Search" style={{padding: 10, width: 240}}/>
        <Results posts={this.state.posts} />
      </div>
    )
  }
}
