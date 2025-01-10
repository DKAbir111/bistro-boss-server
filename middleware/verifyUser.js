var jwt = require('jsonwebtoken');

const userVerification = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: "forbidden access" });
    }

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            console.error('JWT verification error:', err.message); // Log the error
            return res.status(403).send({ message: "invalid token" });
        }


        req.decoded = decoded; // Attach decoded payload to request object
        next(); // Proceed to the next middleware/route handler
    });
};

module.exports = userVerification;
