const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    console.log(' fetchUser middleware called for path:', req.path);
    console.log('Token present:', token ? 'YES' : 'NO');
    
    if (!token) {
        console.log(' No token provided');
        return res.status(401).send({ error: "Access Denied: No token provided" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        console.log('Token verified, user:', data.user);
        req.user = data.user;
        next(); 
    } catch (error) {
        console.log(' Token verification failed:', error.message);
        res.status(401).send({ error: "Invalid Token" });
    }
}

module.exports = fetchUser;