const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

/* ================= DB ================= */

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("Mongo Error:", err.message);
    process.exit(1);
  });

/* ================= MODELS ================= */

const User = mongoose.model("User", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "legal_user" },
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", {
  userId: mongoose.Schema.Types.ObjectId,
  chatId: String,
  title: String,
  messages: Array,
  createdAt: { type: Date, default: Date.now }
});

/* ================= AUTH ================= */

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

/* ================= CHAT ROUTES ================= */

/* SAVE CHAT */
app.post("/chat/save", auth, async (req, res) => {
  try {
    const { chatId, messages } = req.body;

    const firstUserMsg = messages.find(m => m.sender === "user");
    const title = firstUserMsg
      ? firstUserMsg.text.slice(0, 40)
      : "New Legal Discussion";

    const existing = await Chat.findOne({
      userId: req.userId,
      chatId
    });

    if (existing) {
      existing.messages = messages;
      existing.title = title;
      await existing.save();
    } else {
      await Chat.create({
        userId: req.userId,
        chatId,
        title,
        messages
      });
    }

    res.json({ msg: "Saved" });

  } catch (err) {
    console.error("Save Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* LIST */
app.get("/chat/list", auth, async (req, res) => {
  const chats = await Chat.find({ userId: req.userId })
    .sort({ createdAt: -1 });

  res.json(chats);
});

/* LOAD */
app.get("/chat/:chatId", auth, async (req, res) => {
  const chat = await Chat.findOne({
    userId: req.userId,
    chatId: req.params.chatId
  });

  if (!chat) return res.status(404).json({ msg: "Not found" });

  res.json(chat);
});

/* DELETE (REAL FIX) */
app.delete("/chat/:chatId", auth, async (req, res) => {
  try {
    const result = await Chat.deleteOne({
      userId: req.userId,
      chatId: req.params.chatId
    });

    console.log("Delete result:", result);

    res.json({ msg: "Deleted" });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
