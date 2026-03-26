// backend/src/routes/auth.ts
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Your Mongoose model
import { env } from '../config/env.js';
import type { ISignUpRequest } from '@auto-hub/shared/types/user';

const router = Router();

router.post('/signup', async (req, res) => {
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
    
    // Ensure you have a JWT_SECRET in your .env file!
    const token = jwt.sign(tokenPayload, env.jwtSecret || 'super_secret_fallback', {
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
    res.status(201).json({ 
      message: "User created successfully!",
      token: token, // The mobile app will grab this and save it to SecureStore
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: "An unexpected server error occurred." });
  }
});

router.post('/login', async (req, res) => {
  
    res.status(200).json({ message: "Login successful!" });
});

export default router
