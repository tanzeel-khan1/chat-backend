import Conversation from "../models/Conversation.js";
import Message from "../models/MessageModal.js";
import { emitToUser, getReceiverSocketId } from "../SocketIO/server.js";
import User from "../models/User.js";
import { sendPushToUser } from "../utils/webPush.js";
import { getFrontendUrl } from "../config/urls.js";


export const sendMessages = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 🔴 BLOCK CHECK
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    if (sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({
        message: "You blocked this user. Unblock to send messages.",
      });
    }

    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({
        message: "You are blocked by this user.",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "_id name email")
      .populate("receiver", "_id name email");

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });

    emitToUser(receiverId, "newMessage", populatedMessage);
    emitToUser(senderId, "newMessage", populatedMessage);

    const receiverOnline = Boolean(getReceiverSocketId(receiverId));
    if (!receiverOnline) {
      const preview =
        message.trim().length > 60
          ? `${message.trim().slice(0, 60)}...`
          : message.trim();
      sendPushToUser(receiverId, {
        title: `${sender.name} ne message bheja`,
        body: preview,
        senderId: String(senderId),
        url: getFrontendUrl(),
      }).catch((err) => console.error("Push notification error:", err));
    }
  } catch (error) {
    console.error("sendMessages error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

/* =========================================================
   GET ALL MESSAGES (WITH BLOCK CHECK)
========================================================= */

export const getAllMessages = async (req, res) => {
  try {
    const { id: chatuser } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const senderId = req.user._id;

    // 🔴 BLOCK CHECK
    const sender = await User.findById(senderId);
    const receiver = await User.findById(chatuser);

    if (
      sender.blockedUsers.includes(chatuser) ||
      receiver?.blockedUsers.includes(senderId)
    ) {
      return res.status(403).json({
        message: "Chat not available. User is blocked.",
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, chatuser] },
    }).populate({
      path: "messages",
      populate: [
        { path: "sender", select: "_id name email" },
        { path: "receiver", select: "_id name email" },
      ],
    });

    if (!conversation) {
      return res.status(404).json({ message: "No Messages Found" });
    }

    const sortedMessages = conversation.messages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({ messages: sortedMessages });
  } catch (error) {
    console.log("Message getting error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* =========================================================
   DELETE MESSAGE
========================================================= */

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await Conversation.updateOne(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    await Message.findByIdAndDelete(messageId);

    if (message.receiver) {
      emitToUser(message.receiver, "messageDeleted", { messageId });
    }
    if (message.sender) {
      emitToUser(message.sender, "messageDeleted", { messageId });
    }

    return res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("deleteMessage error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET MESSAGES BY NAME (WITH BLOCK CHECK)
========================================================= */

export const getMessagesByName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findOne({ name: name.trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const senderId = req.user._id;
    const receiverId = user._id;

    const sender = await User.findById(senderId);

    if (
      sender.blockedUsers.includes(receiverId) ||
      user.blockedUsers.includes(senderId)
    ) {
      return res.status(403).json({
        message: "Chat not available. User is blocked.",
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages",
      populate: [
        { path: "sender", select: "_id name email" },
        { path: "receiver", select: "_id name email" },
      ],
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "No messages found with this user" });
    }

    const sortedMessages = conversation.messages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({ messages: sortedMessages });
  } catch (error) {
    console.error("getMessagesByName error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET MESSAGES BY NAME AND DATE (WITH BLOCK CHECK)
========================================================= */

export const getMessagesByNameAndDate = async (req, res) => {
  try {
    const { name, date } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!date || !Date.parse(date)) {
      return res.status(400).json({ message: "Valid date is required" });
    }

    const user = await User.findOne({ name: name.trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const senderId = req.user._id;
    const receiverId = user._id;

    const sender = await User.findById(senderId);

    if (
      sender.blockedUsers.includes(receiverId) ||
      user.blockedUsers.includes(senderId)
    ) {
      return res.status(403).json({
        message: "Chat not available. User is blocked.",
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "No messages found with this user" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const filteredMessages = conversation.messages.filter((msg) => {
      const msgDate = new Date(msg.createdAt);
      return msgDate >= startDate && msgDate <= endDate;
    });

    if (!filteredMessages.length) {
      return res
        .status(404)
        .json({ message: "No messages found on this date" });
    }

    const sortedMessages = filteredMessages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({ messages: sortedMessages });
  } catch (error) {
    console.error("getMessagesByNameAndDate error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET ALL CHAT (ADMIN)
========================================================= */

export const getAllChat = async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate("sender", "_id name email")
      .populate("receiver", "_id name email")
      .sort({ createdAt: -1 });

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("getAllChats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const userId = req.user._id;        // logged in user
    const { targetId } = req.params;    // user to block

    if (!targetId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId.toString() === targetId) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Already blocked check
    const currentUser = await User.findById(userId);

    if (currentUser.blockedUsers.includes(targetId)) {
      return res.status(400).json({ message: "User already blocked" });
    }

    // Add to blockedUsers
    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: targetId },
    });

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    console.error("blockUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetId } = req.params;

    if (!targetId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const currentUser = await User.findById(userId);

    if (!currentUser.blockedUsers.includes(targetId)) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: targetId },
    });

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    console.error("unblockUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const checkBlockStatus = async (req, res) => {
  try {
    const userId = req.user._id;      // logged-in user
    const { targetId } = req.params;  // user to check

    if (!targetId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const currentUser = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const status = {
      youBlocked: currentUser.blockedUsers.includes(targetId),
      blockedBy: targetUser.blockedUsers.includes(userId),
    };

    return res.status(200).json({ success: true, status });
  } catch (error) {
    console.error("checkBlockStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
};