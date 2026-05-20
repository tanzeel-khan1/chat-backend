import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../jwt/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword, // optional to store
    });

    // Save user
    await newUser.save();

    // ❌ Removed generateToken here
    // generateToken(newUser._id, res);

    // ✔ Response only
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // ✔ Token only on login
    generateToken(user._id, res);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    console.log("Logged-in user ID:", loggedInUserId);

    const allUsers = await User.find().select(
      "-password -confirmPassword -__v"
    );

    const filteredUsers = allUsers.filter(
      (user) => user._id.toString() !== loggedInUserId.toString()
    );

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("error getallusers", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -confirmPassword -__v"
    );

    res.status(200).json({
      message: "All users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.log("error getAllUsers", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // URL se user ID

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("error deleteUser", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};