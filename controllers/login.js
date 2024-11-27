const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body; // get the username and password from the request body, note that the password is not hashed

    const user = await User.findOne({ username }); //get user from database by username

    const passwordCorrect = user === null //check if user exists and password is correct
        ? false
        : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        });
    }

    const userForToken = { //create token
        username: user.username,
        id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 }) // use secret from .env to sign token and set expiration to 1 hour

    response //send token and user info
        .status(200)
        .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
