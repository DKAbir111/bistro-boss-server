const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router()
const userVerification = require('../middleware/verifyUser')
// const adminVerification = require('../middleware/verifyAdmin')


const createUserRoute = (userCollections) => {

    //middleware
    const adminVerification = async (req, res, next) => {
        try {
            const email = req.decoded.email
            // console.log({ email })
            const user = await userCollections.findOne({ email });
            const isAdmin = user?.role === 'admin'
            if (!isAdmin) {
                return res.status(403).send({ message: "You are not authorized to access this route" });
            }
            // console.log(isAdmin)
        }
        catch (error) {
            console.error('Admin verification error:', error.message);
        }
        next()
    }


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
    router.get('/user', userVerification, adminVerification, async (req, res) => {
        // console.log(req.headers.authorization.split(' ')[1])
        const users = await userCollections.find().toArray();
        res.send(users);
    })


    // Make admin or demote admin
    router.patch('/user/:id', userVerification, adminVerification, async (req, res) => {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id)
        };

        const user = await userCollections.findOne(filter);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.email === "darun15-14188@diu.edu.bd") {
            return res.status(403).send({ message: "You are not authorized to change this user's role" });
        }
        let updateDoc;
        if (user.role === 'admin') {
            // Demote admin to user
            updateDoc = { $set: { role: 'user' } };
        } else {
            // Promote user to admin
            updateDoc = { $set: { role: 'admin' } };
        }

        const result = await userCollections.updateOne(filter, updateDoc);
        res.send(result);
    });



    //delete user by id
    router.delete('/user/admin/:id', userVerification, adminVerification, async (req, res) => {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id)
        };
        const user = await userCollections.findOne(filter);
        if (user.email = "darun15-14188@diu.edu.bd") {
            return res.status(403).send({ message: 'unauthorized access' })
        }
        const result = await userCollections.deleteOne({ _id: new ObjectId(id) })
        res.send(result);
    })

    //check user is admin or not
    router.get('/user/admin/:email', userVerification, async (req, res) => {
        const email = req.params.email
        if (email !== req.decoded.email) {
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