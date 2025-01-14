const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { ObjectId } = require('mongodb'); // Ensure ObjectId is imported for type matching
const createMenuRoute = require('./router/menuRoute')
const createAddCartRoute = require('./router/addCartRoute')
const createReviewRoute = require('./router/reviewRoute')
const createUserRoute = require('./router/userRoute.js')
const createSecurityRoute = require('./router/SecurityRoute.js')
const createPaymentIntent = require('./router/paymentRoute')
const createBookingRoute = require('./router/bookingRoute')
const app = express()

const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Boss in sitting on the chair...')
})

//mongodb_connect

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xratx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //database, collections and routes
        const database = client.db('bistroDB')
        const menuCollections = database.collection('menu');
        const addCartCollections = database.collection('addcart');
        const reviewCollections = database.collection('review');
        const userCollections = database.collection('user');
        const paymentCollections = database.collection('payment');
        const bookingCollections = database.collection('booking');
        // await client.connect();
        //security Routes
        app.use('/api', createSecurityRoute())
        //menu-collections route
        app.use('/api', createMenuRoute(menuCollections, userCollections))

        //add-cart route
        app.use('/api', createAddCartRoute(addCartCollections, menuCollections))

        //review route
        app.use('/api', createReviewRoute(reviewCollections))

        //Boook table
        app.use('/api', createBookingRoute(bookingCollections, userCollections))
        //user route
        app.use('/api', createUserRoute(userCollections))

        //payment intent
        app.use('/api', createPaymentIntent(paymentCollections, addCartCollections))

        //user-State
        app.get('/api/user-stats', async (req, res) => {
            const email = req.query.email
            const reviewCount = await reviewCollections.countDocuments({ email })
            const bookingCount = await bookingCollections.countDocuments({ email })
            const paymentCount = await paymentCollections.countDocuments({ email })
            const totalMenu = await menuCollections.countDocuments()
            const menus = await paymentCollections.find({ email }).toArray()
            const totalOrder = menus.reduce((total, item) => total + item.menuIds.length, 0)
            res.send({ reviewCount, bookingCount, paymentCount, totalOrder, totalMenu })

        })

        // stats or analytics-admin
        app.get('/admin-stats', async (req, res) => {
            const users = await userCollections.estimatedDocumentCount();
            const menuItems = await menuCollections.estimatedDocumentCount();
            const orders = await paymentCollections.estimatedDocumentCount();

            // this is not the best way
            // const payments = await paymentCollection.find().toArray();
            // const revenue = payments.reduce((total, payment) => total + payment.price, 0);

            const result = await paymentCollections.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: '$total'
                        }
                    }
                }
            ]).toArray();

            const revenue = result.length > 0 ? result[0].totalRevenue : 0;

            res.send({
                users,
                menuItems,
                orders,
                revenue
            })
        })


        // using aggregate pipeline


        app.get('/order-stats', async (req, res) => {
            try {
                const result = await paymentCollections.aggregate([
                    {
                        $unwind: '$menuIds' // Split menuIds array to process each item
                    },
                    {
                        $lookup: {
                            from: 'menu', // Reference the 'menu' collection
                            localField: 'menuIds', // Link menuIds field in payment
                            foreignField: '_id', // Match _id field in menu
                            as: 'menuItems' // Output matching documents in an array
                        }
                    },
                    {
                        $unwind: '$menuItems' // Unwind menuItems array for individual processing
                    },
                    {
                        $group: {
                            _id: '$menuItems.category', // Group by menu item category
                            quantity: { $sum: 1 }, // Total items in each category
                            revenue: { $sum: '$menuItems.price' } // Total revenue per category
                        }
                    },
                    {
                        $project: {
                            _id: 0, // Exclude _id field from final output
                            category: '$_id', // Rename _id to category for clarity
                            quantity: 1, // Include quantity in the result
                            revenue: 1 // Include revenue in the result
                        }
                    }
                ]).toArray();

                if (!result.length) {
                    return res.status(404).send({ message: 'No order statistics found.' });
                }

                console.log(result); // Debugging: Log result to console
                res.send(result); // Send aggregated statistics
            } catch (error) {
                console.error('Error fetching order stats:', error.message); // Log error details
                res.status(500).send({ error: 'Failed to fetch order statistics.', details: error.message });
            }
        });



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`)
})
