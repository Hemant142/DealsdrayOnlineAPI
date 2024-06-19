const jwt = require("jsonwebtoken");
const { BlacklistModel } = require('../Models/Blacklist');

const auth = async (req, res, next) => {
    const token = req.headers.authorization;

    try {
        if (token) {
            const blacklistedToken = await BlacklistModel.findOne({
                blacklist: token
            });

            if (blacklistedToken) {
                return res.status(400).json({ message: "Please login again!" });
            }

            jwt.verify(token, process.env.SecretKey, (err, decoded) => {
                if (decoded) {
                    req.body.userId = decoded.userId;
                    next();
                } else {
                    res.status(401).json({ message: "Invalid token. Please login again." });
                }
            });
        } else {
            res.status(401).json({ message: "Token is not provided. Please login." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    auth
};
