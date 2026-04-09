import { Response } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import Location from '../models/Location'
import Service from '../models/Service'; // Needed to securely calculate totals
import { AuthRequest } from '../middleware/authMiddleware';
import { sendNotification } from '../utils/notifications';
// --- HELPER ---
const safeParseDuration = (duration: any): number => {
    if (!duration) return 0;
    if (typeof duration === 'number') return duration;
    const parsed = parseInt(String(duration).replace(/[^0-9]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
};

// --- 1. GET ALL APPOINTMENTS FOR A LOGGED IN USER ---
export const getAppointments = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Extrage locationId din query-ul URL-ului (dacă există)
        const { locationId } = req.query;
        const userId = req.user!.userId;

        // 2. Construiește query-ul dinamic
        let query: any = {};

        if (locationId) {
            // --- OWNER VIEW ---
            // Dacă frontend-ul trimite un locationId, aducem toate programările pentru acel service
            query = { locationId: locationId as string };

            // Opțional pe viitor: Aici poți adăuga un check de securitate 
            // pentru a te asigura că `userId` este proprietarul acestui `locationId`.
        } else {
            // --- CLIENT VIEW ---
            // Dacă nu există locationId, aducem doar programările personale ale userului
            query = { clientId: userId };
        }

        // 3. Execută căutarea cu query-ul corect
        const appointments = await Appointment.find(query)
            .sort({ date: 1, time: 1 })
            .populate('clientId', 'fullName email phoneNumber') // <--- ADAUGĂ ACEASTĂ LINIE!
            .populate('locationId', 'name')
            .populate('carId', 'make model plateNr')
            .populate('serviceIds', 'name price duration');

        return res.status(200).json(appointments);
    } catch (error) {
        console.error("Eroare la obținerea programărilor:", error);
        return res.status(500).json({ message: "Eroare la aducerea programărilor." });
    }
};

// --- 2. CREATE A NEW APPOINTMENT ---
export const createAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const { locationId, carId, serviceIds, date, time, notes } = req.body;

        if (!locationId || !carId || !serviceIds || !date || !time) {
            return res.status(400).json({ message: "Toate câmpurile obligatorii trebuie completate." });
        }

        const services = await Service.find({ _id: { $in: serviceIds } });

        if (services.length !== serviceIds.length) {
            return res.status(400).json({ message: "Unul sau mai multe servicii sunt invalide." });
        }

        // 2. Calculate Truthful Totals
        const { totalDuration, totalPrice } = services.reduce(
            (acc, service) => {
                const durationVal = safeParseDuration(service.duration);
                const priceVal = typeof service.price === 'string'
                    ? parseFloat(service.price) || 0
                    : service.price || 0;

                return {
                    totalDuration: acc.totalDuration + durationVal,
                    totalPrice: acc.totalPrice + priceVal,
                };
            },
            { totalDuration: 0, totalPrice: 0 }
        );

        // 3. Create the Appointment and inject the guaranteed userId
        const newAppointment = new Appointment({
            ...req.body,
            clientId: req.user!.userId, // Injecting the user securely from middleware
            status: 'pending',          // Force default status
            totalPrice,                 // Use backend-calculated price
            totalDuration               // Use backend-calculated duration
        });

        const savedAppointment = await newAppointment.save();
        await savedAppointment.populate([
            { path: 'locationId', select: 'name' },
            { path: 'carId', select: 'make model plateNr' },
            { path: 'serviceIds', select: 'name price duration' }
        ]);

        try {
            // Aducem locația și populăm compania pentru a afla cine e "șeful"
            const location = await Location.findById(locationId).populate('companyId');

            if (location && location.companyId) {
                // AICI TREBUIE SĂ ADAPTEZI ÎN FUNCȚIE DE SCHEMA TA `Company`
                // Presupunem că pe modelul Company ai un câmp `userId` sau `ownerId`
                const company = location.companyId as any;
                const ownerId = company.userId || company.ownerId;

                if (ownerId) {
                    await sendNotification(
                        ownerId.toString(),
                        'appointments', // Folosim categoria 'appointments'
                        'Programare Nouă! 📅',
                        `Ai primit o nouă cerere de programare la ${location.name} pentru ${date} la ${time}.`,
                        {route: `/(service)/(tabs)/calendar?id=${locationId}&date=${date}`}
                    );
                }
            }
        } catch (notifError) {
            // Nu oprim request-ul dacă notificarea pică, doar o logăm
            console.error("Eroare la trimiterea notificării către service:", notifError);
        }

        return res.status(201).json(savedAppointment);
    } catch (error) {
        console.error("Eroare la crearea programării:", error);
        return res.status(500).json({ message: "Eroare la crearea programării." });
    }
};

// --- 3. EDIT AN EXISTING APPOINTMENT ---
export const editAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const appointmentId = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: "ID-ul programării este invalid." });
        }

        const updates = req.body;
        // Security checks: Prevent users from arbitrarily changing important backend fields
        delete updates.totalPrice;
        delete updates.totalDuration;
        delete updates.clientId;

        // SECURITY FIX: Match BOTH the appointmentId AND the clientId!
        const updatedAppointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId },
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        ).populate('clientId', 'fullName email phoneNumber')
            .populate('locationId', 'name')
            .populate('carId', 'make model plateNr')
            .populate('serviceIds', 'name price duration');

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Programarea nu a fost găsită sau nu ai permisiunea de a o edita." });
        }

        const newStatus = updates.status;
        if (newStatus && newStatus === "confirmed") {

            const clientData = updatedAppointment.clientId as any;
            const locationData = updatedAppointment.locationId as any;

            await sendNotification(
                clientData._id,
                'appointments',
                'Programare Confirmată! ✅',
                `Programarea ta la ${locationData.name} a fost confirmată.`,
                {route: '/(client)/(tabs)/program'}
            );
        }
        return res.status(200).json(updatedAppointment);
    } catch (error) {
        console.error("Eroare la actualizarea programării:", error);
        return res.status(500).json({ message: "Eroare la actualizarea programării." });
    }
};

// --- 4. DELETE (CANCEL) AN APPOINTMENT ---
export const deleteAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const appointmentId = req.params.id as string;

        if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: "ID-ul programării este invalid." });
        }

        const cancelledAppointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, clientId: req.user!.userId }, // SECURITY MATCH
            { status: 'cancelled' },
            { returnDocument: 'after' }
        );

        if (!cancelledAppointment) {
            return res.status(404).json({ message: "Programarea nu a fost găsită sau nu ai permisiunea de a o anula." });
        }

        return res.status(200).json({ message: "Programarea a fost anulată cu succes.", id: appointmentId });
    } catch (error) {
        console.error("Eroare la anularea programării:", error);
        return res.status(500).json({ message: "Eroare la anularea programării." });
    }
};