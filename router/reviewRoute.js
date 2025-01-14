const express = require('express')

const router = express.Router()
const userVerification = require('../middleware/verifyUser')
const createReviewRoute = (reviewCollections) => {

    router.get('/reviews', async (req, res) => {
        const result = await reviewCollections.find().toArray();
        res.send(result);
    })

    //add add to cart
    router.post('/add-review', userVerification, async (req, res) => {
        const newReview = req.body
        const result = await reviewCollections.insertOne(newReview);
        res.json(result);
    })

    // by email
    router.get('/add-review', userVerification, async (req, res) => {
        const email = req.query.email;
        const myReview = await reviewCollections.find({ email }).toArray();
        res.send(myReview);
    })



    return router;
}

module.exports = createReviewRoute;