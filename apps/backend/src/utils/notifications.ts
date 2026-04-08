// backend/src/utils/notifications.ts
import { Expo } from 'expo-server-sdk';
import User from '../models/User.js';

let expo = new Expo();

export const sendNotification = async (
    userId: string, 
    category: 'appointments' | 'documents' | 'promotions' | 'service', 
    title: string, 
    body: string
) => {
    const user = await User.findById(userId);

    if (!user || !user.pushToken) return; // User doesn't have the app installed/allowed

    // --- 🚨 THE MAGIC: CHECK PREFERENCES 🚨 ---
    // If the user turned off this specific toggle in the UI, silently abort!
    if (user.notificationPreferences && user.notificationPreferences[category] === false) {
        console.log(`User ${user.email} opted out of ${category} notifications.`);
        return; 
    }

    // Check if it's a valid Expo token
    if (!Expo.isExpoPushToken(user.pushToken)) {
        console.error(`Push token ${user.pushToken} is not a valid Expo push token`);
        return;
    }

    // Create the message
    const messages = [{
        to: user.pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: { route: '/(client)/(tabs)/calendar' }, // Data to handle when user taps the notification
    }];

    // Send it to Expo
    try {
        let chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
}