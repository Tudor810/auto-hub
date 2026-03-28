import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { 
    getServices, 
    createService, 
    editService, 
    deleteService 
} from "../controllers/serviceController";

const router = Router();

// GET /api/services?locationId=123
router.get("/", authenticateToken, getServices);

// POST /api/services
router.post("/", authenticateToken, createService);

// PUT /api/services/:id
router.put("/:id", authenticateToken, editService);

// DELETE /api/services/:id
router.delete("/:id", authenticateToken, deleteService);

export default router;