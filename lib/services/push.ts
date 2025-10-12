import { supabase } from '../../context/AuthContext';

export type PushSubscriptionData = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(userId: string, sub: PushSubscriptionData) {
  if (!supabase) throw new Error('Database unavailable');
  const { error } = await supabase.from('push_subscriptions').insert({
    user_id: userId,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  });
  if (error && !String(error.message).includes('duplicate')) throw error;
}

export async function subscribeToPush(userId: string, publicVapidKey: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;
  const convertedKey = urlBase64ToUint8Array(publicVapidKey);
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey,
  });
  await savePushSubscription(userId, sub.toJSON() as any);
  return sub;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
