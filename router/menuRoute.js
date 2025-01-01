const express = require('express')

const router = express.Router()

const createMenuRoute = (menuCollections) => {

    //get all menu
    router.get('/menu', async (req, res) => {
        const menuItems = await menuCollections.find().toArray();
        res.json(menuItems);
    })

    return router;
}

module.exports = createMenuRoute;