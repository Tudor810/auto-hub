// backend/src/routes/index.ts
import { Router } from 'express';

// Import your individual route files
import authRouter from './authRoutes.js';
import companyRouter from './companyRoutes.js'
import locationRouter from './locationRoutes.js'
import serviceRouter from './serviceRoutes.js'
import carRouter from './carRoutes.js';
import appointmentRouter from './appointmentRoutes.js'
 
// import userRouter from './user.js';


const router = Router();

// Mount them to their specific paths
router.use('/auth', authRouter);
router.use('/companies', companyRouter);
router.use('/locations', locationRouter);
router.use('/services', serviceRouter);
router.use('/cars', carRouter);
router.use('/appointments', appointmentRouter);
// Export this bundled master router
export default router;