var _ = require('lodash');

const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
      return sum + item.likes
    }
  
    return blogs.length === 0
      ? 0
      : blogs.reduce(reducer, 0)
  }

const favouriteBlog = (blogs) => {
    // Etsii kaikkien blogien likejen maksimin
    const mostLikes = Math.max(...blogs.map(blog => blog.likes))

    // Etsii blogeista listasta sen blogin, jolla on eniten likejä
    const favourite = blogs.find(blog => blog.likes === mostLikes)

    const { title, author, likes } = favourite

    return { title, author, likes }
    
}

const mostBlogs = (blogs) => {
    const occurrances = _.countBy(blogs, "author")

    const authorWithMostBlogs = _.maxBy(
        Object.keys(occurrances).map(author => ({ author, blogs: occurrances[author] })),
        'blogs'
    );

    return authorWithMostBlogs
}

const mostLikes = (blogs) => {
    return _.chain(blogs) // _.chain() allows us to chain lodash functions
      .groupBy('author') // Group blogs by author
      .map((authorBlogs, author) => ({ // Map author blogs to author and likes
        author,
        likes: _.sumBy(authorBlogs, 'likes') // Sum likes for each author
      }))
      .maxBy('likes') // Find author with most likes
      .value(); // Return the value
  }
    
 
  
  module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes
  }