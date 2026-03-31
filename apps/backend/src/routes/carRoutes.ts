import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { 
    getCars, 
    createCar, 
    editCar, 
    deleteCar
} from "../controllers/carController";

const router = Router();

// GET /api/services?locationId=123
router.get("/", authenticateToken, getCars);

// POST /api/services
router.post("/", authenticateToken, createCar);

// PUT /api/services/:id
router.put("/:id", authenticateToken, editCar);

// DELETE /api/services/:id
router.delete("/:id", authenticateToken, deleteCar);

export default router;