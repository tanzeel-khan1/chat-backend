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
const generateToken = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_TOKEN, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,     // ❗ localhost ke liye FALSE
    sameSite: "Lax",   // ❗ frontend-backend different ports ke liye BEST
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
