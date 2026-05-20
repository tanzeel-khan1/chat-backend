import jwt from "jsonwebtoken";
import User from "../models/User.js";

// const secureRoute = async (req, res, next) => {
//   try {
//     const token = req.cookies.jwt;
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: No token provided" });
//     }
//     const verified = jwt.verify(token, process.env.JWT_TOKEN);
//     if (!verified) {
//       return res.status(403).json({ message: "Unauthorized: Invalid token" });
//     }
//     const user = await User.findById(verified.userId).select("-assword");
//     if (!user) {
//       return res.status(404).json({ message: " User not found" });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(501).json({ message: "internal server" });
//   }
// };
const secureRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const verified = jwt.verify(token, process.env.JWT_TOKEN);

    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default secureRoute;
