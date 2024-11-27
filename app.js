const config = require('./utils/config')
const express = require("express")
const app = express()
require('express-async-errors')
const cors = require("cors")
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

console.log(config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)


app.use(cors())
app.use(express.json())

app.use(middleware.errorHandler)
app.use(middleware.tokenExtractor)


app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)




module.exports = app
