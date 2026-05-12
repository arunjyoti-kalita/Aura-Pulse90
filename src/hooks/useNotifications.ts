import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (!user || typeof Notification === 'undefined' || !messaging) return;

    const requestPermission = async () => {
      try {
        const status = await Notification.requestPermission();
        setPermission(status);
        
        if (status === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });
          
          if (token) {
            // Store token in Firestore for this user
            await setDoc(doc(db, "push_tokens", user.uid), {
              token,
              updatedAt: new Date().toISOString(),
              platform: 'web'
            });
          }
        }
      } catch (error) {
        console.error("Notification error:", error);
      }
    };

    if (permission === 'default') {
      requestPermission();
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      toast(payload.notification?.title || 'New Notification', {
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, [user, permission]);

  return { permission };
}
