const express = require('express')
const router = express.Router()

const createUserRoute = (userCollections) => {

    router.post('/user', async (req, res) => {
        const newUser = req.body;
        const email = newUser.email;

        const isExist = await userCollections.findOne({ email })
        if (isExist) {
            return res.status(400).send('Email already exists');
        }
        const result = await userCollections.insertOne(newUser);
        res.send(result);
    })
    return router;
}

module.exports = createUserRoute;