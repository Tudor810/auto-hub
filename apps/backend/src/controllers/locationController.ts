import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import Location from '../models/Location'
import mongoose from 'mongoose'
import { calculateAvailableSlots } from "../utils/timeUtils";
import Appointment from "../models/Appointment";
import { log } from "node:console";

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

export const getAllLocations = async (req: AuthRequest, res: Response) => {

    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch(error) {
        console.log("Eroare:", error);
        res.status(500).json({message: "Nu există conexiune la internet"})
    }
}

export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; 
        const { date, duration } = req.query; 

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: "ID locație invalid." });
        }
        
        if (!date) {
            return res.status(400).json({ message: "Data este obligatorie." });
        }

        const targetDateStr = date as string;

        // --- 1. GET TODAY's DATE (Server Time) ---
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        // --- 2. NEW: BLOCK PAST DATES COMPLETELY ---
        // Because YYYY-MM-DD is alphabetical, standard string comparison works perfectly!
        // "2026-04-05" < "2026-04-06" is TRUE.
        if (targetDateStr < todayStr) {
            // Return an empty array immediately without querying the DB
            return res.json({ availableSlots: [] }); 
        }

        // 3. Fetch the Location to get its schedule
        const location = await Location.findById(id);
        if (!location) {
            return res.status(404).json({ message: "Locația nu a fost găsită." });
        }

        // 4. Fetch existing appointments
        const appointments = await Appointment.find({
            locationId: id,
            date: targetDateStr,
            status: { $ne: 'cancelled' }
        });

        const existingAppointments = appointments.map(app => ({
            time: app.time,
            durationMinutes: app.totalDuration 
        }));

        // 5. Prepare parameters for the engine
        const targetDate = new Date(targetDateStr);
        const serviceDuration = duration ? parseInt(duration as string, 10) : 30;

        // --- 6. BLOCK PAST HOURS (If the date is exactly today) ---
        let minAllowedTimeInMinutes = 0;

        if (targetDateStr === todayStr) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const bookingBuffer = 30; // Minutes to give the client time to drive there
            minAllowedTimeInMinutes = currentMinutes + bookingBuffer;
        }

        // 7. Run the engine
        const availableSlots = calculateAvailableSlots(
            targetDate,
            location.schedule,
            existingAppointments,
            serviceDuration,
            minAllowedTimeInMinutes
        );

        res.json({ availableSlots });

    } catch (error) {
        console.error("Eroare la calcularea sloturilor:", error);
        res.status(500).json({ message: "Eroare internă la calcularea orelor disponibile." });
    }
};