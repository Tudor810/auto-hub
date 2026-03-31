import { Response } from 'express';
import mongoose from 'mongoose';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/authMiddleware';

// --- 1. GET ALL CARS FOR A LOGGED IN USER ---
export const getCars = async (req: AuthRequest, res: Response) => {
    try {
        const cars = await Car.find({ userId: req.user!.userId }).sort({ createdAt: -1 }); 
        return res.status(200).json(cars);
    } catch (error) {
        console.error("Eroare la obținerea mașinilor:", error);
        return res.status(500).json({ message: "Eroare la aducerea mașinilor." });
    }
};

// --- 2. CREATE A NEW CAR ---
export const createCar = async (req: AuthRequest, res: Response) => {
    try {
        // We inject the guaranteed userId from the middleware into the new car
        const newCar = new Car({
            ...req.body,
            userId: req.user!.userId
        });

        const savedCar = await newCar.save();
        return res.status(201).json(savedCar);
    } catch (error) {
        console.error("Eroare la crearea mașinii:", error);
        return res.status(500).json({ message: "Eroare la crearea mașinii." });
    }
};

// --- 3. EDIT AN EXISTING CAR ---
export const editCar = async (req: AuthRequest, res: Response) => {
    try {
        const carId = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({ message: "ID-ul mașinii este invalid." });
        }

        // SECURITY FIX: Match BOTH the carId AND the userId so users can't edit other people's cars!
        const updatedCar = await Car.findOneAndUpdate(
            { _id: carId, userId: req.user!.userId },
            { $set: req.body },
            { returnDocument: 'after', runValidators: true } // Note: 'new: true' is the standard Mongoose equivalent to 'returnDocument: after'
        );

        if (!updatedCar) {
            return res.status(404).json({ message: "Mașina nu a fost găsită sau nu ai permisiunea de a o edita." });
        }

        return res.status(200).json(updatedCar);
    } catch (error) {
        console.error("Eroare la actualizarea mașinii:", error);
        return res.status(500).json({ message: "Eroare la actualizarea mașinii." });
    }
};

// --- 4. DELETE A CAR ---
export const deleteCar = async (req: AuthRequest, res: Response) => {
    try {
        const carId = req.params.id as string;

        if (!carId && !mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({ message: "ID-ul mașinii este invalid." });
        }

        // SECURITY FIX: Match BOTH the carId AND the userId
        const deletedCar = await Car.findOneAndDelete({ _id: carId, userId: req.user!.userId });

        if (!deletedCar) {
            return res.status(404).json({ message: "Mașina nu a fost găsită sau nu ai permisiunea de a o șterge." });
        }

        return res.status(200).json({ message: "Mașina a fost ștearsă cu succes.", id: carId });
    } catch (error) {
        console.error("Eroare la ștergerea mașinii:", error);
        return res.status(500).json({ message: "Eroare la ștergerea mașinii." });
    }
};