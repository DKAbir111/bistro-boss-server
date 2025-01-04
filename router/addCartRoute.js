const express = require('express')

const router = express.Router()

const createAddCartRoute = (addCartCollections) => {

    //get all menu
    router.post('/add-cart', async (req, res) => {
        const newItem = req.body
        const result = await addCartCollections.insertOne(newItem);
        res.json(result);
    })

    return router;
}

module.exports = createAddCartRoute;