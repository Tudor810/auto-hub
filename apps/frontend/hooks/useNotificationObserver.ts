import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export function useNotificationObserver() {
  const router = useRouter();
  
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // 1. Când aplicația e deschisă
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificare primită cu aplicația deschisă!');
    });

    // 2. Când utilizatorul APASĂ pe notificare din Lock Screen
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Datele din notificare:', data);

      // Logica este acum super simplă: dacă backend-ul ne dă o rută, mergem la ea!
      if (data && data.route) {
        // Folosim `as any` pentru a evita erorile stricte de tipizare din Expo Router
        router.push(data.route as any);
      }
    });

    // 3. Cleanup la demontare
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
}