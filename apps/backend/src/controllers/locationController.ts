import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import Location from '../models/Location'
import mongoose from 'mongoose'

export const getLocations = async (req: AuthRequest, res: Response) => {
    try {

        const companyId = req.query.companyId as string;

        if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "Token invalid: Structura ID-ului este coruptă." });
        }

        const companyObjectId = new mongoose.Types.ObjectId(companyId);
        const locations = await Location.find({ companyId: companyObjectId });

        res.status(200).json(locations)

    } catch (err) {
        console.error("Eroare la aducerea companiei:", err);
        res.status(500).json({ message: "Eroare de server la verificarea companiei." });
    }
}

export const createLocation = async (req: AuthRequest, res: Response) => {
    try {

        const companyId = req.query.companyId as string;

        if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "Token invalid: Structura ID-ului este coruptă." });
        }

        const companyObjectId = new mongoose.Types.ObjectId(companyId);

        const newLocation = new Location({
            ...req.body,
            companyId: companyObjectId
        });

        const savedLocation = await newLocation.save();
        res.status(201).json(savedLocation);
    } catch (error) {
        console.error("Eroare:", error);
        res.status(500).json({ message: "Eroare la crearea companiei." });
    }
}

export const editLocation = async (req: AuthRequest, res: Response) => {
    try {
        
        const locationId = req.params.id as string;

        // Validate both IDs
        if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
            return res.status(400).json({ message: "ID-ul locației este invalid sau lipsește." });
        }


        // 3. Update the location
        const updatedLocation = await Location.findOneAndUpdate(
            {
                _id: locationId,
            },
            { $set: req.body },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedLocation) {
            return res.status(404).json({ message: "Locația nu a fost găsită sau nu vă aparține." });
        }

        // Use 200 (OK) instead of 201 (Created) for updates
        res.status(200).json(updatedLocation);

    } catch (error) {
        console.error("Eroare:", error);
        // Fixed the copy-paste error message here too :)
        res.status(500).json({ message: "Eroare la actualizarea locației." });
    }
}