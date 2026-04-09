// backend/src/utils/notifications.ts
import { Expo } from 'expo-server-sdk';
import User from '../models/User.js';

let expo = new Expo();

export const sendNotification = async (
    userId: string, 
    category: 'appointments' | 'documents' | 'promotions' | 'service', 
    title: string, 
    body: string,
    data?: Record<string, any> // <-- 1. NOU: Am adăugat parametrul opțional 'data'
) => {
    const user = await User.findById(userId);

    if (!user || !user.pushToken) return; // Utilizatorul nu are aplicația

    // Verificăm preferințele
    if (user.notificationPreferences && user.notificationPreferences[category] === false) {
        console.log(`User ${user.email} opted out of ${category} notifications.`);
        return; 
    }

    // Verificăm dacă token-ul este valid
    if (!Expo.isExpoPushToken(user.pushToken)) {
        console.error(`Push token ${user.pushToken} is not a valid Expo push token`);
        return;
    }

    // Creăm mesajul
    const messages = [{
        to: user.pushToken,
        sound: 'default' as const, 
        title: title,
        body: body,
        data: data || {}, // <-- 2. NOU: Folosim datele primite, sau un obiect gol dacă nu primim nimic
    }];

    // Trimitem către Expo
    try {
        let chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
}