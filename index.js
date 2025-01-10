const express = require('express')
const cors = require('cors')
require('dotenv').config()

const createMenuRoute = require('./router/menuRoute')
const createAddCartRoute = require('./router/addCartRoute')
const createReviewRoute = require('./router/reviewRoute')
const createUserRoute = require('./router/userRoute.js')
const createSecurityRoute = require('./router/SecurityRoute.js')

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


//database, collections and routes
const database = client.db('bistroDB')
const menuCollections = database.collection('menu');
const addCartCollections = database.collection('addcart');
const reviewCollections = database.collection('review');
const userCollections = database.collection('user');
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        //security Routes
        app.use('/api', createSecurityRoute())

        //menu-collections route
        app.use('/api', createMenuRoute(menuCollections))

        //add-cart route
        app.use('/api', createAddCartRoute(addCartCollections, menuCollections))

        //review route
        app.use('/api', createReviewRoute(reviewCollections))

        //user route
        app.use('/api', createUserRoute(userCollections))

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

module.exports = { userCollections }
