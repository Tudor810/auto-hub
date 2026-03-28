// backend/src/routes/index.ts
import { Router } from 'express';

// Import your individual route files
import authRouter from './authRoutes.js';
import companyRouter from './companyRoutes.js'
import locationRouter from './locationRoutes.js'

// import userRouter from './user.js';
// import carRouter from './car.js';

const router = Router();

// Mount them to their specific paths
router.use('/auth', authRouter);
router.use('/companies', companyRouter);
router.use('/locations', locationRouter);

// Export this bundled master router
export default router;