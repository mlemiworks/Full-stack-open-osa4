const { test, describe, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const listHelper = require('../utils/list_helper')
const app = require('../app')
const helper = require('./test_helper')


const api = supertest(app)


beforeEach(async () => {

  await helper.initializeDb();
})




describe('dummy', () => {
  test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
  })
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  // chekc to see if total likes is calculated correctly when there is only one blog
  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })


  // check to see if total likes is calculated correctly
  test('when list has multiple blogs equals the likes of that', () => {
    const result = listHelper.totalLikes(helper.initialBlogs)
    assert.strictEqual(result, 36)
  })
})


describe('finding blogs by different criteria', () => {
  test('find favourite', () => {

    const expected = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12
    }

    const result = listHelper.favouriteBlog(helper.initialBlogs)
    assert.strictEqual(result.likes, expected.likes)

  })



  test("find author with most blogs", () => {
    const expected = {
      author: "Robert C. Martin",
      blogs: 3
    }

    const result = listHelper.mostBlogs(helper.initialBlogs)
    assert.deepStrictEqual(result, expected)
  })

  test("find author with most likes", () => {
    const result = listHelper.mostLikes(helper.initialBlogs);

    const expected = {
      author: "Edsger W. Dijkstra",
      likes: 17
    };
    assert.deepStrictEqual(result, expected);
  });
})

// Tehtävät 4.8 -->
describe('response format checks', () => {
  test('response is in json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })


  // Check if keys are all "id"
  test('blog identifier is "id"', async () => {
    const response = await api.get('/api/blogs');

    response.body.forEach(blog => {
      const keys = Object.keys(blog);

      assert.strictEqual(keys.includes('id'), true);
    });
  });

})



describe('test for adding, deleting and updating blogs', () => {

  test('blog is added, and total blogs grows by one', async () => {


    const newBlog = {
      title: "newblog",
      author: "Arto Hellas",
      url: "www.someblog.com",
      likes: 24
    }

    const user = helper.initialUsers[0] // arto

    //login to get token
    const loginResponse = await api
      .post('/api/login')
      .send({ username: user.username, password: user.password })
      .expect(200)

    const token = loginResponse.body.token

    // request to add new blog
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const response = await api.get('/api/blogs')


    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  })

  // test to see if default value of likes is 0 if not given
  test('blog is added, without likes', async () => {
    const newBlog = {
      title: "newblog2",
      author: "someauthor2",
      url: "www.someblog2.com"
    }

    const user = helper.initialUsers[0] // arto

    //login to get token
    const loginResponse = await api
      .post('/api/login')
      .send({ username: user.username, password: user.password })
      .expect(200)

    const token = loginResponse.body.token

    // request to add new blog
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const blogs = response.body.map(r => r)
    //console.log(blogs)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1) // make sure it's added

    assert.strictEqual(blogs[blogs.length - 1].likes, 0); // check if last object's like key value = 0
  })

  // test to see if code 400 is returned if title or url is missing
  test('blog\'s title or url missing, return 400', async () => {
    const newBlog = {
      author: "someauthor",
      likes: 24
    }

    const user = helper.initialUsers[0] // arto

    //login to get token
    const loginResponse = await api
      .post('/api/login')
      .send({ username: user.username, password: user.password })
      .expect(200)

    const token = loginResponse.body.token

    // request to add new blog
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  // test to see if blog is deleted successfully
  test('blog is deleted', async () => {
    const response = await api.get('/api/blogs')

    const blogToDelete = response.body[0] // arto in this case

    const user = helper.initialUsers[0] // arto again


    const loginResponse = await api
      .post('/api/login')
      .send({ username: user.username, password: user.password })
      .expect(200)

    const token = loginResponse.body.token

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body.length, helper.initialBlogs.length - 1)
  })

  // test to see if blog is updated by adding likes
  test('blog is updated by adding likes', async () => {
    const response = await api.get('/api/blogs')
    const blogToUpdate = response.body[0]

    const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }; // updated blog with one more like

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body[0].likes, updatedBlog.likes)
  })

  // middleware catches this one
  test('blog is being added with invalid token', async () => {
    const newBlog = {
      title: "newblog",
      author: "Arto Hellas",
      url: "www.someblog.com",
      likes: 24
    }

    const token = "invalidtoken"

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(401)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })
})


/// User related tests
describe('user related tests', () => {
  test('add a valid user'), async () => {
    const newUser = {
      username: "newuser",
      name: "newname",
      password: "newpassword"
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await api.get('/api/users')

    assert.strictEqual(usersAtEnd.body.length, helper.initialUsers.length + 1)

  }

  test('add a user with invalid password'), async () => {
    const newUser = {
      username: "newuser",
      name: "newname",
      password: "ne"
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await api.get('/api/users')

    assert.strictEqual(usersAtEnd.body.length, helper.initialUsers.length)
  }

  test('add a user with existing username'), async () => {
    const newUser = {
      username: "hellas",
      name: "newname",
      password: "newpassword"
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await api.get('/api/users')

    assert.strictEqual(usersAtEnd.body.length, helper.initialUsers.length)
  }
})

after(async () => {
  await mongoose.connection.close()
})