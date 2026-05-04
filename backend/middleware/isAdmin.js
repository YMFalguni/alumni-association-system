const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Make sure this is in your .env file

const isAdmin = (req, res, next) => {
    // req.user was populated by the fetchUser middleware
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Forbidden: Admin access required" });
    }
    next();
};

module.exports = isAdmin;