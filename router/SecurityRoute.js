const express = require('express')
const jwt = require('jsonwebtoken');
const router = express.Router()

const createSecurityRoute = () => {
    router.post('/jwt', async (req, res) => {
        const user = req.body;
        const token = jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })
        res.send(token);
    })

    return router;
}

module.exports = createSecurityRoute;