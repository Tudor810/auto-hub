import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {getLocations, createLocation, editLocation, getAllLocations, getAvailableSlots, getGoogleLocations, getGooglePlaceDetails, deleteLocation} from "../controllers/locationController"

const router = Router();

router.get("/", authenticateToken, getLocations);

router.post("/", authenticateToken, createLocation);

router.put("/:id", authenticateToken, editLocation);

router.delete("/:id", authenticateToken, deleteLocation);

router.get("/public", authenticateToken, getAllLocations);

router.get("/:id/slots", authenticateToken, getAvailableSlots);

router.get("/google", authenticateToken, getGoogleLocations);

router.get("/google-details", authenticateToken, getGooglePlaceDetails);

export default router