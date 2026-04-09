import cron from 'node-cron';
import Car from '../models/Car.js'; // Modelul tău de Mongoose
import { sendNotification } from '../utils/notifications.js';

// Funcție care verifică dacă o dată expiră în exact 'daysWarning' zile
const isExpiringIn = (targetDate: Date, daysWarning: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetăm orele pentru a compara doar zilele

    const expDate = new Date(targetDate);
    expDate.setHours(0, 0, 0, 0);

    // Diferența în milisecunde transformată în zile
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === daysWarning;
};

// Funcția principală care rulează job-ul
export const checkExpiringDocuments = async () => {
    console.log('Running daily document expiration check...');

    try {
        // Căutăm toate mașinile care au MĂCAR o dată setată
        const cars = await Car.find({
            $or: [
                { itpDate: { $ne: null } },
                { rcaDate: { $ne: null } },
                { rovinietaDate: { $ne: null } }
            ]
        });

        for (const car of cars) {
            const userId = car.userId.toString();

            // Verificăm fiecare document. Vrem să-i anunțăm cu 7 zile înainte și cu 1 zi înainte
            const alertDays = [7, 1]; 

            alertDays.forEach(async (days) => {
                
                // 1. Verificare ITP
                if (car.itpDate && isExpiringIn(car.itpDate, days)) {
                    await sendNotification(
                        userId,
                        'documents',
                        'ITP-ul expiră curând! ⚠️',
                        `ITP-ul pentru ${car.plateNr} expiră în ${days} zi(le). Programează-te la un service.`,
                        {route: '/(client)/my-garage'}
                    );
                }

                // 2. Verificare RCA
                if (car.rcaDate && isExpiringIn(car.rcaDate, days)) {
                    await sendNotification(
                        userId,
                        'documents',
                        'Asigurarea RCA expiră! 🛡️',
                        `RCA-ul pentru ${car.plateNr} expiră în ${days} zi(le). Nu uita să o reînnoiești.`,
                        {route: '/(client)/my-garage'}
                    );
                }

                // 3. Verificare Rovinietă
                if (car.rovinietaDate && isExpiringIn(car.rovinietaDate, days)) {
                    await sendNotification(
                        userId,
                        'documents',
                        'Rovinieta expiră! 🛣️',
                        `Rovinieta pentru ${car.plateNr} expiră în ${days} zi(le).`,
                        {route: '/(client)/my-garage'}
                    );
                }
            });
        }
    } catch (error) {
        console.error('Error checking expiring documents:', error);
    }
};

// Setăm Cron Job-ul să ruleze în fiecare zi la ora 09:00 dimineața
export const initCronJobs = () => {
    // "0 9 * * *" înseamnă ora 09:00, în fiecare zi a lunii, în fiecare lună
    cron.schedule('0 9 * * *', () => {
        checkExpiringDocuments();
    });
    console.log('Cron Jobs initialized.');
};