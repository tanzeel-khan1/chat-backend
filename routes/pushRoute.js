import express from "express";
import secureRoute from "../middleware/secureRoute.js";
import {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
} from "../controllers/pushController.js";

const router = express.Router();

router.get("/vapid-public-key", getVapidPublicKey);
router.post("/subscribe", secureRoute, subscribePush);
router.delete("/unsubscribe", secureRoute, unsubscribePush);

export default router;
