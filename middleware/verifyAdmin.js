

const adminVerification = async (req, res, next) => {
    try {
        const email = req.decoded.email
        console.log({ email })
        const user = await userCollections.findOne({ email });
        console.log(user)
    }
    catch (error) {
        console.error('Admin verification error:', error.message);
    }


    next()
}

module.exports = adminVerification;