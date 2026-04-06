// backend/src/routes/auth.ts
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import { env } from '../config/env.js';
import type { ISignUpRequest, IAuthUser, IAuthSuccessResponse, ILoginRequest, IUserUpdateResponse } from '@auto-hub/shared/types/userTypes';
import { OAuth2Client } from 'google-auth-library';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware.js';
import { Response, Request } from 'express';

const client = new OAuth2Client(env.googleWebClientId);

export const handleSignUp = async (req: Request, res: Response) => {
    try {
        const data: ISignUpRequest = req.body;

        // 1. Verificăm dacă utilizatorul există deja
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(409).json({ message: "Un cont cu această adresă de email există deja." });
        }

        // 2. Hash parola
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        // 3. Salvare utilizator
        const newUser = new User({
            role: data.role,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: hashedPassword,
            termsAccepted: data.termsAccepted,
        });

        await newUser.save();

        // 4. Generare JWT
        const tokenPayload = { userId: newUser._id, role: newUser.role };
        const token = jwt.sign(tokenPayload, env.jwtToken || 'super_secret_fallback', {
            expiresIn: '7d'
        });

        // 5. Setare Cookie (pentru Web)
        res.cookie('token', token, {
            httpOnly: true,
            secure: env.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const user: IAuthUser = {
            id: newUser._id.toString(),
            email: newUser.email,
            phoneNumber: newUser.phoneNumber,
            fullName: newUser.fullName,
            role: newUser.role as 'customer' | 'provider'
        };

        const successData: IAuthSuccessResponse = {
            message: "Cont creat cu succes!",
            token: token,
            user: user
        };

        res.status(201).json(successData);

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: "A apărut o eroare neașteptată la server." });
    }
}

export const handleLogin = async (req: Request, res: Response) => {
    const data: ILoginRequest = req.body;
    try {
        const user = await User.findOne({ email: data.email });

        if (!user) {
            return res.status(401).json({ message: "Email sau parolă incorectă." });
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password || '');
        if (!passwordMatch) {
            return res.status(401).json({ message: "Email sau parolă incorectă." });
        }

        const tokenPayload = { userId: user._id, role: user.role };
        const token = jwt.sign(tokenPayload, env.jwtToken, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: env.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const successData: IAuthSuccessResponse = {
            message: "Autentificare reușită!",
            token: token,
            user: {
                id: user._id.toString(),
                email: user.email,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                role: user.role as 'customer' | 'provider'
            }
        };

        res.status(200).json(successData);
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: "A apărut o eroare neașteptată la server." });
    }
}

export const handleGoogleLogin = async (req: Request, res: Response) => {
    const { idToken, accessToken } = req.body;

    let email: string;
    let name: string;
    let googleId: string;

    try {
        if (idToken) {
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: env.googleWebClientId,
            });

            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                return res.status(400).json({ message: "Datele Google sunt invalide." });
            }
            email = payload.email;
            name = payload.name || '';
            googleId = payload.sub;
        }
        else if (accessToken) {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                return res.status(400).json({ message: "Token de acces Google invalid." });
            }

            const payload = await response.json();
            email = payload.email;
            name = payload.name || '';
            googleId = payload.sub;
        } else {
            return res.status(400).json({ message: "Nu a fost furnizat niciun token Google." });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                fullName: name,
                googleId,
                role: null,
                termsAccepted: true,
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const tokenPayload = { userId: user._id, role: user.role };
        const token = jwt.sign(tokenPayload, env.jwtToken, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: env.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const successData: IAuthSuccessResponse = {
            message: "Autentificare Google reușită!",
            token: token,
            user: {
                id: user._id.toString(),
                email: user.email,
                phoneNumber: user.phoneNumber || "",
                fullName: user.fullName,
                role: user.role
            }
        };

        res.status(200).json(successData);

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: "Token Google invalid." });
    }
}

export const handleEditRole = async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.body;
        const userId = req.user?.userId;

        if (!role || !['customer', 'provider'].includes(role)) {
            return res.status(400).json({ message: "Rol selectat invalid." });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
        }

        const successData: IUserUpdateResponse = {
            message: "Rolul a fost actualizat cu succes!",
            user: {
                id: user._id.toString(),
                email: user.email,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                role: user.role
            }
        };

        res.status(200).json(successData);
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ message: "Eroare la actualizarea rolului." });
    }
}

export const handleLogout = (req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'lax',
    });
    res.status(200).json({ message: "Deconectare reușită." });
}

export const getUserData = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId).select('-password -googleId');

        if (!user) return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });

        const successData: IUserUpdateResponse = {
            message: "Datele utilizatorului au fost recuperate!",
            user: {
                id: user._id.toString(),
                email: user.email,
                phoneNumber: user.phoneNumber,
                fullName: user.fullName,
                notificationPreferences: user.notificationPreferences,
                role: user.role
            }
        };

        res.status(200).json(successData);
    } catch (error) {
        console.error('Fetch User Data Error:', error);
        res.status(500).json({ message: "Eroare la preluarea datelor utilizatorului." });
    }
};

export const handleSetPreferences = async (req: AuthRequest, res: Response) => {
    try {
        const { preferences } = req.body;
        const userId = req.user?.userId;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { notificationPreferences: preferences } },
            { returnDocument: 'after' }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
        }

        res.status(200).json({ message: "Preferințe salvate cu succes.", user: updatedUser });
    } catch(error) {
        res.status(500).json({ message: "Eroare la salvarea preferințelor." });
    }
}

export const handleForgotPassword = (req: Request, res: Response) => {
    // Aici va veni logica pentru trimitere email de resetare
}