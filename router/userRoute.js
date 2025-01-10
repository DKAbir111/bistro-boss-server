const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router()
const userVerification = require('../middleware/verifyUser')

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


    //fetch all user
    router.get('/user', userVerification, async (req, res) => {
        // console.log(req.headers.authorization.split(' ')[1])
        const users = await userCollections.find().toArray();
        res.send(users);
    })

    //make admin
    router.patch('/user/:id', async (req, res) => {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id)
        }
        const updateDoc = {
            $set: {
                role: 'admin',
            }
        }
        const result = await userCollections.updateOne(filter, updateDoc)
        res.send(result);
    })

    //fetch user by email
    router.get('/user/admin', async (req, res) => {
        const email = req.query.email
        const user = await userCollections.findOne({ email });
        res.send(user);
    })

    //delete user by id
    router.delete('/user/admin/:id', async (req, res) => {
        const id = req.params.id;
        const result = await userCollections.deleteOne({ _id: new ObjectId(id) })
        res.send(result);
    })

    //check user is admin or not

    router.get('/user/admin/:email', userVerification, async (req, res) => {
        const email = req.params.email
        if (email !== req.decoded.user.email) {
            return res.status(403).send({ message: 'unauthorized access' })
        }
        let admin = false
        const user = await userCollections.findOne({ email });
        if (user && user.role === 'admin') {
            admin = true
        }
        res.send({ admin });

    })
    return router;
}

module.exports = createUserRoute;