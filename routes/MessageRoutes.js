import express from "express";
import {
  sendMessages,
  getAllMessages,
  deleteMessage,
  getMessagesByName,
  getMessagesByNameAndDate,
  getAllChat,
  blockUser,
  unblockUser,
  checkBlockStatus,
} from "../controllers/MessageController.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();

router.post("/send/:id", secureRoute, sendMessages);
router.get("/get/:id", secureRoute, getAllMessages);
router.delete("/:messageId", secureRoute, deleteMessage);
router.post("/", secureRoute, getMessagesByName);
router.post("/by-date", secureRoute, getMessagesByNameAndDate);
router.get("/", getAllChat);
router.put("/block/:targetId", secureRoute, blockUser);
router.put("/unblock/:targetId", secureRoute, unblockUser);
router.get("/status/:targetId", secureRoute, checkBlockStatus);
export default router;
