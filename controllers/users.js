const userRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 });
    response.json(users);
});

userRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body;

    if (password.length < 3) {
        return response.status(400).json({ error: "password minimum length 3 characters" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
        username,
        name,
        passwordHash
    });

    const result = await user.save();
    response.status(201).json(result);
});

module.exports = userRouter;