import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {getLocations, createLocation, editLocation, getAllLocations, getAvailableSlots} from "../controllers/locationController"

const router = Router();

router.get("/", authenticateToken, getLocations);

router.post("/", authenticateToken, createLocation);

router.put("/:id", authenticateToken, editLocation);

router.get("/public", authenticateToken, getAllLocations);

router.get("/:id/slots", authenticateToken, getAvailableSlots)
export default router