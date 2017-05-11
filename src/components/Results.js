import React from 'react'

export default props => {
  const postsJsx = props.posts.map(post => {
    return (
      <article key={post._id}>
        <header>
          <h1>{post._source.title}</h1>
          <p><b>by {post._source.authorId}</b></p>
        </header>

        <div>
          {post._source.body}
        </div>

        <hr />
      </article>
    )
  })

  return <div>{postsJsx}</div>
}
