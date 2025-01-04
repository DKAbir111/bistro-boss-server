const express = require('express')

const router = express.Router()

const createMenuRoute = (menuCollections) => {

    //get all menu
    router.get('/menu', async (req, res) => {
        const menuItems = await menuCollections.find().toArray();
        res.json(menuItems);
    })

    //chef recommends- choose random 3
    router.get('/menu/chef', async (req, res) => {
        const menuItems = await menuCollections.aggregate([{ $sample: { size: 3 } }]).toArray()
        res.json(menuItems);
    })

    return router;
}

module.exports = createMenuRoute;