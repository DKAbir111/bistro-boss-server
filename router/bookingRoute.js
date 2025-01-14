const express = require('express')
const { ObjectId } = require('mongodb')
const router = express.Router()
const userVerification = require('../middleware/verifyUser')
const createBookingRoute = (bookingCollection, userCollections) => {
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
    //add add to cart
    router.post('/booking', userVerification, async (req, res) => {
        const newBook = req.body
        const result = await bookingCollection.insertOne(newBook);
        res.json(result);
    })

    //getAllBookings
    router.get('/bookings', userVerification, async (req, res) => {
        const result = await bookingCollection.find().toArray();
        res.send(result);
    })

    //update
    router.patch('/booking/:id', userVerification, adminVerification, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        updateDoc = { $set: { status: 'Done' } };
        const result = await bookingCollection.updateOne(filter, updateDoc);
        res.send(result);

    })


    // by email
    router.get('/booking', userVerification, async (req, res) => {
        const email = req.query.email;
        const bookingItems = await bookingCollection.find({ email }).toArray();
        res.send(bookingItems);
    })



    return router;
}

module.exports = createBookingRoute;