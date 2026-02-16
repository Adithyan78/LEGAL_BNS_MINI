const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");

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
/* SIGNUP */
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      msg: "User created",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
/* LOGIN */
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

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


/* ================= AI INTEGRATION ================= */


app.post("/api/analyze-case", async (req, res) => {
  try {
    const { case_description } = req.body;

    if (!case_description) {
      return res.status(400).json({
        success: false,
        message: "Case description is required",
      });
    }

    // Send request to FastAPI service
    const response = await axios.post(
      "http://localhost:8000/analyze",
      {
        case_description: case_description,
      },
      {
        timeout: 120000, // 120 sec timeout for RAG
      }
    );

    // Send AI result back to frontend
    res.status(200).json({
      success: true,
      analysis: response.data,
    });

  } catch (error) {
    console.error("AI Service Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI analysis failed",
    });
  }
});

app.post("/api/analyze-case-stream", async (req, res) => {
  try {
    const { case_description } = req.body;

    if (!case_description) {
      return res.status(400).send("Case description is required");
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Call FastAPI streaming endpoint
    const response = await axios.post(
      "http://localhost:8000/analyze-stream", // FastAPI streaming endpoint
      {
        case_description: case_description,
      },
      {
        responseType: "stream", // IMPORTANT: enables streaming
        timeout: 0, // no timeout for streaming
      }
    );

    // Forward chunks to frontend
    response.data.on("data", (chunk) => {
      res.write(chunk.toString());
    });

    response.data.on("end", () => {
      res.end();
    });

    response.data.on("error", (err) => {
      console.error("Stream error:", err);
      res.end();
    });

  } catch (error) {
    console.error("Streaming API Error:", error.message);
    res.status(500).end("Streaming failed");
  }
});


/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
