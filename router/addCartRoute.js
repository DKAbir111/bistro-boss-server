const express = require('express')
const { ObjectId } = require('mongodb')

const router = express.Router()
const userVerification = require('../middleware/verifyUser')
const createAddCartRoute = (addCartCollections, menuCollections) => {

    //add add to cart
    router.post('/add-cart', userVerification, async (req, res) => {
        const newItem = req.body
        const result = await addCartCollections.insertOne(newItem);
        res.json(result);
    })

    // get by email
    router.get('/cart', userVerification, async (req, res) => {
        const email = req.query.email;
        const cartItems = await addCartCollections.find({ email }).toArray();
        const menuItems = await Promise.all(
            cartItems.map(async (item) => {
                const menuItem = await menuCollections.findOne({ _id: item.menuId });
                if (menuItem === null) {
                    const menuItem = await menuCollections.findOne({ _id: new ObjectId(item.menuId) });
                    return {
                        cartId: item._id,
                        menuId: menuItem._id,
                        ...menuItem
                    }
                }
                return {
                    cartId: item._id,
                    menuId: menuItem._id,
                    ...menuItem
                }
            })
        );
        res.send(menuItems);
    })

    // delete from cart
    router.delete('/cart/:cartId', userVerification, async (req, res) => {
        const id = req.params.cartId;
        const result = await addCartCollections.deleteOne({ _id: new ObjectId(id) })
        res.send(result);
    })


    return router;
}

module.exports = createAddCartRoute;