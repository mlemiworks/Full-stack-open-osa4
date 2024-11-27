const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body;

  const user = request.user;



  const blog = new Blog({
    title: body.title,
    author: body.author || "",
    url: body.url,
    likes: body.likes || 0, // likes on 0 jos ei annettu
    user: user._id
  });

  if (body.title === undefined || body.url === undefined) {
    response.status(400).end()
  } else {
    const savedBlog = await blog.save(); // save blog to database
    user.blogs = user.blogs.concat(savedBlog._id); // add blog to user's blogs
    await user.save(); //finally save user to database

    response.status(201).json(savedBlog);
  }
})

// delete a blog
blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const { id } = request.params;

  const user = request.user;

  const blog = await Blog.findById(id);

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndDelete(id);
  }

  response.status(204).end(); // 204 = no content
})

// update likes of a blog
blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params;
  const { likes } = request.body;

  const blog = {
    likes: likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate
    (id, blog, { new: true });
  response.json(updatedBlog);
})

module.exports = blogsRouter