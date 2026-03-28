import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getMyCompany, createCompany, editCompany } from "../controllers/companyController";

const router = Router()

router.get("/my-company", authenticateToken, getMyCompany);

router.post("/my-company", authenticateToken, createCompany);

router.put("/my-company", authenticateToken, editCompany);


export default router;