import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import mongoose from 'mongoose';

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
        console.log("Authentication required.");
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        // 2. Verify the token using your secret key
        const decoded = jwt.verify(token, env.jwtToken) as { userId: string; role: any };

        // --- 3. BARIERA DE PROTECȚIE MONGOOSE AICI ---
        if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
            return res.status(401).json({ message: "Token invalid: Structura ID-ului este coruptă." });
        }

        req.user = {
            userId: decoded.userId, 
            role: decoded.role
        };

        next(); // Move to the actual route handler
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};
