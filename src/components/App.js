import React, {Component} from 'react'
import Appbase from 'appbase-js'
import axios from 'axios'
import _, {sortBy} from 'lodash'

import Results from './Results'

const appbaseReadRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  app: 'ReactOnly',
  credentials: 'MxU3hL0zf:88d32ec1-65ba-485c-a6b1-1a8ccf67bcea'
})

const appbaseWriteRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  app: 'ReactOnly',
  credentials: '4YGjflpEg:2267ccf8-711f-493c-99b0-c430cbbf1a1c'
})

export default class App extends Component {
  constructor() {
    super()

    this.state = {
      posts: [],
      searchQuery: ''
    }
  }

  componentDidMount() {
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
                    body: 'quod commodi'
                  }
                }
              ]
            }
          }
        }
      })
      .on('data', res => {
        console.log(res)
        this.setState({
          posts: _.orderBy(res.hits.hits, o => Number(o._score), ['desc'])
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
                    body: 'quod commodi'
                  }
                }
              ]
            }
          }
        }
      })
      .on('data', res => {
        this.setState({
          posts: _.orderBy([res, ...this.state.posts], o => o._score, ['desc'])
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

  handleChange = e => {
    e.preventDefault()

    this.setState({
      searchQuery: e.target.value
    })
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
