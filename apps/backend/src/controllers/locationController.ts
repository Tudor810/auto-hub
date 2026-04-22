import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import Location from '../models/Location'
import mongoose from 'mongoose'
import { calculateAvailableSlots } from "../utils/timeUtils";
import Appointment from "../models/Appointment";
import { env } from '../config/env';

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

export const deleteLocation = async (req: AuthRequest, res: Response) => {
    try {
        const locationId = req.params.id as string;

        // Validate the ID
        if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
            return res.status(400).json({ message: "ID-ul locației este invalid sau lipsește." });
        }

        // Delete the location
        const deletedLocation = await Location.findOneAndDelete({
            _id: locationId,
        });

        // Check if it actually existed before trying to delete
        if (!deletedLocation) {
            return res.status(404).json({ message: "Locația nu a fost găsită sau a fost deja ștearsă." });
        }

        // Send a 200 OK with a confirmation message
        res.status(200).json({ 
            message: "Locația a fost ștearsă cu succes.",
            deletedId: deletedLocation._id 
        });

    } catch (error) {
        console.error("Eroare:", error);
        res.status(500).json({ message: "Eroare la ștergerea locației." });
    }
}

export const getAllLocations = async (req: AuthRequest, res: Response) => {
    try {
        const locations = await Location.find()
            .populate({
                path: 'companyId',          // 1. Go from Location to Company
                select: 'phone', 
            });

        res.status(200).json(locations);
    } catch (error) {
        console.error("Eroare server:", error);
        res.status(500).json({ message: "Eroare la preluarea locațiilor" });
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


// 1. Endpoint for Autocomplete (Typing)
export const getGoogleLocations = async (req: AuthRequest, res: Response) => {
    try {
        const { input, sessiontoken } = req.query;

        if (!input || typeof input !== 'string') {
            return res.status(400).json({ message: "Textul de căutare (input) este obligatoriu." });
        }

        const apiKey = env.googleMapsApiKey;
        const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
        
        url.searchParams.append('input', input);
        url.searchParams.append('key', apiKey as string);
        url.searchParams.append('language', 'ro');
        url.searchParams.append('components', 'country:ro');
        url.searchParams.append('types', 'establishment');
        
        // Pass the session token to Google
        if (sessiontoken && typeof sessiontoken === 'string') {
            url.searchParams.append('sessiontoken', sessiontoken);
        }

        const response = await fetch(url.toString());
        const data = await response.json();

        res.status(200).json(data);
    } catch (error) {
        console.error("Eroare în getGoogleLocations:", error);
        res.status(500).json({ message: "Eroare internă la procesarea locațiilor Google." });
    }
}

// 2. Endpoint for Details (Clicking the result)
export const getGooglePlaceDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { place_id, sessiontoken } = req.query;

        if (!place_id || typeof place_id !== 'string') {
            return res.status(400).json({ message: "ID-ul locației (place_id) este obligatoriu." });
        }

        const apiKey = env.googleMapsApiKey;
        const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        
        url.searchParams.append('place_id', place_id);
        url.searchParams.append('key', apiKey as string);
        url.searchParams.append('language', 'ro');
        
        // Restrict fields to ONLY what you need to save massive amounts of money
        // Geometry gets you lat/lng. Name gets the title. 
        url.searchParams.append('fields', 'geometry,name,formatted_address,rating,user_ratings_total');

        // Pass the session token to conclude the billing session
        if (sessiontoken && typeof sessiontoken === 'string') {
            url.searchParams.append('sessiontoken', sessiontoken);
        }

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.result) {
            // Map the value to your frontend's expected key
            data.result.reviews = data.result.user_ratings_total || 0;
            
            // Optional: delete the old key so your network payload is cleaner
            delete data.result.user_ratings_total;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Eroare în getGooglePlaceDetails:", error);
        res.status(500).json({ message: "Eroare internă la preluarea detaliilor locației." });
    }
}