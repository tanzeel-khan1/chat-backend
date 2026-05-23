import express from "express";
import {
  signup,
  login,
  logout,
  getUserProfile,
  getAllUsers,
  deleteUser
} from "../controllers/userController.js";
import secureRoute from "../middleware/secureRoute.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/all", secureRoute, getUserProfile);
router.get("/get-all-users",secureRoute, getAllUsers);
router.delete("/delete-user/:id", deleteUser);



export default router;
