// backend/src/routes/auth.ts
import { Router } from 'express';
import { authenticateToken} from '../middleware/authMiddleware.js';
import { handleSignUp, handleLogin, handleGoogleLogin, handleEditRole, handleLogout, getUserData, handleForgotPassword, handleSetPreferences, updatePushToken, handleResetPassword } from '../controllers/authController.js';

const router = Router();

router.post('/signup', handleSignUp);

router.post('/login', handleLogin);


router.post('/google-login', handleGoogleLogin);

router.put('/update-role', authenticateToken, handleEditRole);

router.post('/logout', handleLogout);

router.get('/me', authenticateToken, getUserData);

router.post("/forgot-password", handleForgotPassword);

router.post("/reset-password", handleResetPassword);

router.put("/preferences", authenticateToken, handleSetPreferences);

router.put("/push-token", authenticateToken, updatePushToken);

export default router
