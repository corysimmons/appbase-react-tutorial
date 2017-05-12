import React from 'react'

export default ({posts}) => {
  const listOfPosts = posts.map(post => {
    // Making our variables a bit more readable.
    const {_id} = post
    const {title, author, body} = post._source

    return (
      <article key={_id}>
        <header>
          <h1>{title}</h1>
          <p>
            <b>Post ID:</b> {_id}<br />
            <b>Written by:</b> {author}
          </p>
        </header>

        <div>{body}</div>

        <hr />
      </article>
    )
  })

  return <div>{listOfPosts}</div>
}
