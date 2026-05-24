import User from "../models/User.js";
import { isPushConfigured } from "../utils/webPush.js";

export const getVapidPublicKey = (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey || !isPushConfigured()) {
    return res.status(503).json({ message: "Push notifications not configured" });
  }
  res.json({ publicKey });
};

export const subscribePush = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { pushSubscriptions: { endpoint: subscription.endpoint } },
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        pushSubscriptions: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("subscribePush error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unsubscribePush = async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ message: "Endpoint required" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { pushSubscriptions: { endpoint } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("unsubscribePush error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
