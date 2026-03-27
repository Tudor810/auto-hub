import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type to include the user
// This prevents TypeScript errors when you call req.user
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: 'customer' | 'provider';
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Get token from Cookies OR Authorization Header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        // 2. Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: any };
        
        // 3. Attach the decoded data to the request object
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next(); // Move to the actual route handler
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};