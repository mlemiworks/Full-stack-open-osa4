const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt');

const initialBlogs = [

  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    user: null,
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    user: null,
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    user: null,
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    user: null,
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    user: null,
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    user: null,
    likes: 2,
    __v: 0
  }
]

const initialUsers = [
  {
    username: "hellas",
    name: "Arto Hellas",
    password: "lumilauta",
    blogs: [],
    id: "6721e908d055a6166810fcc9"
  },
  {
    username: "mluukkai",
    name: "Matti Luukkainen",
    password: "salainen",
    blogs: [],
    id: "6721e926d055a6166810fccb"
  }
]




const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => user.toJSON())
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

// Hash a password using bcrypt
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// generate a hash for each initial user's password
const seedInitialUsers = async () => {
  await User.deleteMany({}); // clear the users collection before seeding

  for (const user of initialUsers) {
    const hashedPassword = await hashPassword(user.password);
    const userWithHashedPassword = new User({
      username: user.username,
      name: user.name,
      passwordHash: hashedPassword, // Save the hashed password
      blogs: user.blogs
    });
    await userWithHashedPassword.save();
  }
};
const seedInitialBlogs = async () => {
  await Blog.deleteMany({});
  const arto = await User.findOne({ username: 'hellas' });

  initialBlogs[0].user = arto._id; // Associate the first blog with Arto
  for (const blog of initialBlogs) {
    const blogObj = new Blog(blog);
    await blogObj.save();
  }
};

// initialize database with initial users and blogs
const initializeDb = async () => {
  await seedInitialUsers();
  await seedInitialBlogs();
};

module.exports = {
  initialBlogs,
  initialUsers,
  usersInDb,
  blogsInDb,
  initializeDb
};