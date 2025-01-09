var jwt = require('jsonwebtoken');
const userVerification = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ messege: "forbidden access" })
    }
    const token = req.headers.authorization.split(' ')[1]

    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ messege: "invalid token" })
        }
        req.decoded = decoded;
        next()
    });
}

module.exports = userVerification;
