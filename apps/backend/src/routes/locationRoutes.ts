import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {getLocations, createLocation, editLocation} from "../controllers/locationController"

const router = Router();

router.get("/", authenticateToken, getLocations);

router.post("/", authenticateToken, createLocation);

router.put("/:id", authenticateToken, editLocation);

export default router;