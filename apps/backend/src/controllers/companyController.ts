import { Request, Response } from "express"
import Company from "../models/Company"
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

export const getMyCompany = async (req: AuthRequest, res: Response) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user?.userId);
        const company = await Company.findOne({ ownerId: userObjectId });

        if (!company) {
            return res.status(404).json({ message: "Nu a fost găsită nicio companie pentru acest utilizator." });
        }

        res.status(200).json(company);

    } catch (err) {
        console.error("Eroare la aducerea companiei:", err);
        res.status(500).json({ message: "Eroare de server la verificarea companiei." });
    }
}

export const createCompany = async (req: AuthRequest, res: Response) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user?.userId);

        const existingCompany = await Company.findOne({ ownerId: userObjectId });

        if (existingCompany)
            return res.status(400).json({ message: "Ai deja o companie configurata." });

        const newCompany = new Company({
            ...req.body,
            ownerId: userObjectId
        });

        const savedCompany = await newCompany.save();
        res.status(201).json(savedCompany);
    } catch (error) {
        console.error("Eroare:", error);
        res.status(500).json({ message: "Eroare la crearea companiei." });
    }
}

export const editCompany = async (req: AuthRequest, res: Response) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user?.userId);
        const updatedCompany = await Company.findOneAndUpdate(
            { ownerId: userObjectId },
            {$set: req.body},
            {returnDocument: 'after', runValidators: true}
        );

        if (!updatedCompany)
            return res.status(404).json({ message: "Compania nu a fost găsită." });

        res.status(201).json(updatedCompany);
    } catch (error) {
        console.error("Eroare:", error);
        res.status(500).json({ message: "Eroare la crearea companiei." });
    }
}