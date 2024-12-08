const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, 'your_jwt_secret');
        
        // Mettre les informations de l'utilisateur dans req.user
        req.user = {
            id: decodedToken.userId,
            role: decodedToken.role
        };
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

module.exports = auth;
