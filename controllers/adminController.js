import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc    Admin Signup
// @route   POST /api/admin/signup
// @access  Public
// export const signupAdmin = async (req, res) => {
//   const { name, email, password, isAdmin } = req.body;

//   try {
//     const adminExists = await Admin.findOne({ email });
//     if (adminExists) {
//       return res.status(400).json({ message: 'Admin already exists' });
//     }

//     const admin = await Admin.create({ name, email, password, isAdmin });
//     res.status(201).json({
//       _id: admin._id,
//       name: admin.name,
//       email: admin.email,
//       isAdmin: admin.isAdmin,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const signupAdmin = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password, isAdmin });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      token: generateToken(admin._id, admin.isAdmin), // ✅ add token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
        token: generateToken(admin._id, admin.isAdmin)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout Admin (frontend will just remove token)
// @route   POST /api/admin/logout
// @access  Private
export const logoutAdmin = async (req, res) => {
  // On frontend, just remove token from localStorage or cookies
  res.json({ message: 'Logged out successfully' });
};
