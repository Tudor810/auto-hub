import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { createAppointment, editAppointment, getAppointments, deleteAppointment } from "../controllers/appointmentController";


const router = Router();

// GET /api/services?locationId=123
router.get("/", authenticateToken, getAppointments);

// POST /api/services
router.post("/", authenticateToken, createAppointment);

// PUT /api/services/:id
router.put("/:id", authenticateToken, editAppointment);

// DELETE /api/services/:id
router.delete("/:id", authenticateToken, deleteAppointment);

export default router;