"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Secret key for JWT verification (make sure this is stored securely, e.g., in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Replace with your secret key
// Middleware to verify JWT token and extract user ID
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Get the token from Bearer token
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        // Verify and decode the token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Check if decoded token has the userId (assumed to be _id or id in the token)
        if (!decoded._id && !decoded.id) {
            return res.status(400).json({ message: 'Invalid token structure, user ID missing.' });
        }
        // Attach userId to the request object for further use
        req.body.userId = decoded._id || decoded.id; // Attach userId to the request body
        // Call the next middleware/handler
        next();
    }
    catch (error) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
    }
};
exports.authMiddleware = authMiddleware;
