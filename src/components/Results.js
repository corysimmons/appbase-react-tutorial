import React from 'react'

export default props => {
  const postsJsx = props.posts.map(post => {
    return (
      <article key={post._id}>
        <header>
          <h1>{post._source.title}</h1>
          <p>
            <b>Post ID:</b> {post._id}<br />
            <b>Written by:</b> {post._source.author}
          </p>
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
