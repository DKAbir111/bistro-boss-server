const express = require('express')

const router = express.Router()
const userVerification = require('../middleware/verifyUser')
const { ObjectId } = require('mongodb')
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

    //create new item
    router.post('/menu', userVerification, adminVerification, async (req, res) => {
        const newItem = req.body
        const result = await menuCollections.insertOne(newItem);
        res.json(result);
    })

    //delete
    router.delete('/menu/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const result = await menuCollections.deleteOne(filter)
        res.send(result);
    })

    // get by id
    router.get('/menu/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const result = await menuCollections.findOne(filter)
        if (result) {
            return res.send(result);
        }
        const result2 = await menuCollections.findOne({ _id: id })
        return res.send(result2);

    })

    //patch item
    router.patch('/menu/:id', async (req, res) => {
        const id = req.params.id;
        const newItem = req.body
        const filter = { _id: new ObjectId(id) }
        const updateDoc = {
            $set: {
                name: newItem.name,
                price: newItem.price,
                recipe: newItem.recipe,
                category: newItem.category,
                image: newItem.image,
            }
        }
        const result = await menuCollections.updateOne(filter, updateDoc)
        if (result.matchedCount === 0) {
            const result2 = await menuCollections.updateOne({ _id: id }, updateDoc)
            return res.send(result2);
        }
        res.send(result);
    })


    return router;
}

module.exports = createMenuRoute;