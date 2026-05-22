import jwt from "jsonwebtoken";

// const generateToken = (userId, res) => {
//   const token = jwt.sign({ id: userId }, process.env.JWT_TOKEN, {
//     expiresIn: "1d",
//   });
//   res.cookie("jwt", token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "strict",
//   });
// };
const isProduction = process.env.NODE_ENV === "production";

const generateToken = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_TOKEN, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const jwtCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

export default generateToken;
