import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Service from '../models/Service'; // Adjust this path to where your model is saved
import { AuthRequest } from '../middleware/authMiddleware';

// --- 1. GET ALL SERVICES FOR A LOCATION ---
export const getServices = async (req: AuthRequest, res: Response) => {
    try {
        const locationId = req.query.locationId as string;

        if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
            return res.status(400).json({ message: "ID-ul locației este invalid sau lipsește." });
        }

        // Fetch all services linked to this location
        const services = await Service.find({ locationId }).sort({ createdAt: -1 }); // Sort newest first
        
        return res.status(200).json(services);
    } catch (error) {
        console.error("Eroare la obținerea serviciilor:", error);
        return res.status(500).json({ message: "Eroare la aducerea serviciilor." });
    }
};

// --- 2. CREATE A NEW SERVICE ---
export const createService = async (req: AuthRequest, res: Response) => {
    try {
        const locationId = req.query.locationId as string || req.body.locationId;

        if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
            return res.status(400).json({ message: "ID-ul locației este invalid sau lipsește." });
        }

        // Create and save the new service
        const newService = new Service({
            ...req.body,
            locationId: new mongoose.Types.ObjectId(locationId)
        });

        const savedService = await newService.save();
        
        return res.status(201).json(savedService); // 201 Created
    } catch (error) {
        console.error("Eroare la crearea serviciului:", error);
        return res.status(500).json({ message: "Eroare la crearea serviciului." });
    }
};

// --- 3. EDIT AN EXISTING SERVICE ---
export const editService = async (req: AuthRequest, res: Response) => {
    try {
        const serviceId = req.params.id as string;

        if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: "ID-ul serviciului este invalid." });
        }

        // findOneAndUpdate with { new: true } returns the updated document
        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            { $set: req.body },
            { returnDocument: 'after', runValidators: true } 
        );

        if (!updatedService) {
            return res.status(404).json({ message: "Serviciul nu a fost găsit." });
        }

        return res.status(200).json(updatedService);
    } catch (error) {
        console.error("Eroare la actualizarea serviciului:", error);
        return res.status(500).json({ message: "Eroare la actualizarea serviciului." });
    }
};

// --- 4. DELETE A SERVICE ---
export const deleteService = async (req: AuthRequest, res: Response) => {
    try {
        const serviceId = req.params.id as string;

        if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: "ID-ul serviciului este invalid." });
        }

        const deletedService = await Service.findByIdAndDelete(serviceId);

        if (!deletedService) {
            return res.status(404).json({ message: "Serviciul nu a fost găsit." });
        }

        return res.status(200).json({ message: "Serviciul a fost șters cu succes.", id: serviceId });
    } catch (error) {
        console.error("Eroare la ștergerea serviciului:", error);
        return res.status(500).json({ message: "Eroare la ștergerea serviciului." });
    }
};