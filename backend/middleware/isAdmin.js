const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

const isAdmin = (req, res, next) => {
    
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: "Forbidden: Admin access required" });
    }
    next();
};

module.exports = isAdmin;