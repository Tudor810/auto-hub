// backend/src/routes/auth.ts
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Your Mongoose model
import { env } from '../config/env.js';
import type { ISignUpRequest, IAuthUser, IAuthSuccessResponse, ILoginRequest, IUserUpdateResponse} from '@auto-hub/shared/types/user';
import { OAuth2Client } from 'google-auth-library';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { Response, Request } from 'express';
const client = new OAuth2Client(env.googleWebClientId);

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    // 1. Extract the strongly-typed data
    const data: ISignUpRequest = req.body;

    // 2. Check if the user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      // 409 Conflict is the standard code for "Email already in use"
      return res.status(409).json({ message: "An account with this email already exists." }); 
    }

    // 3. Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // 4. Save the new user to MongoDB
    const newUser = new User({
      role: data.role,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      termsAccepted: data.termsAccepted,
    });
    
    await newUser.save();

    // 5. Generate the JWT (JSON Web Token)
    // We only put non-sensitive data in the token payload!
    const tokenPayload = { userId: newUser._id, role: newUser.role };
    
    const token = jwt.sign(tokenPayload, env.jwtToken || 'super_secret_fallback', {
      expiresIn: '7d' // Token expires in 7 days
    });

    // 6. Set the HTTP-Only Cookie (For Expo Web)
    res.cookie('token', token, {
      httpOnly: true, // JavaScript cannot read this cookie (prevents XSS attacks)
      secure: env.nodeEnv === 'production', // Only send over HTTPS in production
      sameSite: 'lax', // Allows cookies to work across your frontend/backend ports in dev
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // 7. Send the JSON Response (For Expo Mobile)

    const user : IAuthUser = {
        id: newUser._id.toString(), 
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role as 'customer' | 'provider'
    };

    const successData: IAuthSuccessResponse = {
      message: "User created successfully!",
      token: token,
      user: user
    };

    res.status(201).json(successData);

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: "An unexpected server error occurred." });
  }
});

router.post('/login', async (req: Request, res: Response) => {
    const data : ILoginRequest = req.body;
    try {
        const user = await User.findOne({ email: data.email});

        if(!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password || '');
        if(!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
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

        const successData : IAuthSuccessResponse = {
            message: "Login successful!",
            token: token,
            user: {
                id: user._id.toString(),
                email: user.email,
                fullName: user.fullName,
                role: user.role as 'customer' | 'provider'
            }
        };

        res.status(200).json(successData);
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: "An unexpected server error occurred." });
    }
});


router.post('/google-login', async (req: Request, res: Response) => {
    const { idToken, accessToken } = req.body; // 'role' might be sent from the frontend for new users

    let email: string;
    let name: string;
    let googleId: string;

    try {
        if(idToken) {
            const ticket = await client.verifyIdToken({
              idToken: idToken,
              audience: env.googleWebClientId, 
            });

            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                return res.status(400).json({ message: "Invalid mobile payload." });
            }
            email = payload.email;
            name = payload.name || '';
            googleId = payload.sub;
        }
        else if(accessToken) {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            if (!response.ok) {
                return res.status(400).json({ message: "Invalid access token." });
            }

            const payload = await response.json();
            email = payload.email;
            name = payload.name || '';
            googleId = payload.sub;
        } else {
            return res.status(400).json({ message: "No Google token provided." });
        }
    
        let user = await User.findOne({ email });
        let isBrandNewAccount = false;

        // 3. If user doesn't exist, Create them (Register)
        if (!user) {
            isBrandNewAccount = true;
            user = new User({
                email,
                fullName: name,
                googleId, 
                role: null, 
                termsAccepted: true, 
            });
            await user.save();
        } else if(!user.googleId) {
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

        const successData : IAuthSuccessResponse = {
            message: "Google Login successful!",
            token: token,
            user: {
                id: user._id.toString(),
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        };

        res.status(200).json(successData);

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: "Invalid Google Token" });
    }
});

router.put('/update-role', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.body;
        const userId = req.user?.userId;

        if (!role || !['customer', 'provider'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

       const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        );

        if(!user) {
          return res.status(404).json({ message: "User not found." });
        }

        const successData: IUserUpdateResponse = {
            message: "Role updated successfully!",
            user: {
                id: user._id.toString(),
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        };

        res.status(200).json(successData);
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ message: "An unexpected server error occurred." });
    }
});

export default router
