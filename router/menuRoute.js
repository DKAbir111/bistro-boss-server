const express = require('express')

const router = express.Router()
const userVerification = require('../middleware/verifyUser')
const createMenuRoute = (menuCollections, userCollections) => {
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

    router.post('/menu', userVerification, adminVerification, async (req, res) => {
        const newItem = req.body
        const result = await menuCollections.insertOne(newItem);
        res.json(result);
    })

    return router;
}

module.exports = createMenuRoute;