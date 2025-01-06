const express = require('express')

const router = express.Router()

const createReviewRoute = (reviewCollections) => {

    router.get('/reviews', async (req, res) => {
        const result = await reviewCollections.find().toArray();
        res.send(result);
    })

    return router;
}

module.exports = createReviewRoute;