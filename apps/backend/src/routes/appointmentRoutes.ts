import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { createAppointment, editAppointment, getAppointments, deleteAppointment } from "../controllers/appointmentController";


const router = Router();

// GET /api/appointments?locationId=123 || /api/appointment
router.get("/", authenticateToken, getAppointments);

// POST /api/appointments
router.post("/", authenticateToken, createAppointment);

// PUT /api/appointments/:id
router.put("/:id", authenticateToken, editAppointment);

// DELETE /api/appointments/:id
router.delete("/:id", authenticateToken, deleteAppointment);

export default router;