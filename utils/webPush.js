import webpush from "web-push";
import User from "../models/User.js";

let vapidConfigured = false;

const configureVapid = () => {
  if (vapidConfigured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@chatapp.local";

  if (!publicKey || !privateKey) {
    console.warn(
      "Web Push disabled: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env"
    );
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
};

export const isPushConfigured = () => configureVapid();

export const sendPushToUser = async (userId, payload) => {
  if (!configureVapid()) return;

  const user = await User.findById(userId).select("pushSubscriptions");
  if (!user?.pushSubscriptions?.length) return;

  const body = JSON.stringify(payload);
  const staleEndpoints = [];

  await Promise.all(
    user.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          body
        );
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          staleEndpoints.push(sub.endpoint);
        } else {
          console.error("Push send error:", error.message);
        }
      }
    })
  );

  if (staleEndpoints.length) {
    await User.findByIdAndUpdate(userId, {
      $pull: { pushSubscriptions: { endpoint: { $in: staleEndpoints } } },
    });
  }
};
