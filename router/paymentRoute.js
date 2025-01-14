// Import the Express library to create a router instance
const express = require('express');
const { ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const userVerification = require('../middleware/verifyUser')
// Create a router instance using Express. This router will handle the payment-related endpoints.
const router = express.Router();

// Function to create a payment intent route
const createPaymentIntent = (paymentCollections, addCartCollections) => {

    // Define a POST route for creating a payment intent
    router.post('/create-payment-intent', async (req, res) => {
        // Extract the `price` property from the request body
        const { price } = req.body;

        // Convert the price into cents (Stripe works with the smallest currency unit)
        const amount = parseInt(price * 100);

        // Log the amount to the console for debugging
        console.log(amount, 'amount inside the intent');

        // Use Stripe's API to create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            // The amount to be charged in cents
            amount: amount,

            // Specify the currency for the payment
            currency: 'usd',

            // Define the types of payment methods that can be used
            payment_method_types: ['card']
        });

        // Respond to the client with the client secret of the payment intent
        res.send({
            clientSecret: paymentIntent.client_secret // The client secret is used by the frontend to complete the payment
        });
    });

    //add payment history and delete item from cart

    router.post('/payment', userVerification, async (req, res) => {
        const paymentInfo = req.body
        console.log(paymentInfo.cartIds)
        const result = await paymentCollections.insertOne(paymentInfo)
        const query = {
            _id: {
                $in: paymentInfo.cartIds.map(id => new ObjectId(id))
            }
        }
        console.log(query)
        const deleteResult = await addCartCollections.deleteMany(query)

        res.send({ deleteResult, result })
    })


    // fetch paymentInfo
    router.get('/payment/:email', userVerification, async (req, res) => {
        const email = req.params.email
        const result = await paymentCollections.find({ email }).toArray()
        res.send(result)
    })



    // Return the router instance, which can be used in the main server file
    return router;
};

// Export the function so it can be used in other parts of the application
module.exports = createPaymentIntent;
