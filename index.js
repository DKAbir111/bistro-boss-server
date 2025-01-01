const express = require('express')
require('dotenv').config()


const app = express()

const port = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('Boss in sitting on the chair...')
})

app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`)
})