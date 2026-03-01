require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(cors());


/* ================= CONFIG ================= */

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;


/* ================= TEST ROUTE ================= */

app.get("/", (req, res) => {
  res.json({ msg: "Backend working" });
});


/* ================= DATABASE ================= */

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });


/* ================= MODELS ================= */

const User = mongoose.model("User", {

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "legal_user"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});


const Chat = mongoose.model("Chat", {

  userId: mongoose.Schema.Types.ObjectId,

  chatId: String,

  title: String,

  messages: Array,

  createdAt: {
    type: Date,
    default: Date.now
  }

});


/* ================= PASSWORD REGEX ================= */

const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+|\\:;"'<>,./~`]).{8,}$/;


/* ================= AUTH ROUTES ================= */


/* SIGNUP */

app.post("/auth/signup", async (req, res) => {

  try {

    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "All fields required"
      });
    }

    // normalize email
    email = email.toLowerCase().trim();


    // validate email provider
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        msg: "Invalid email provider"
      });
    }


    // validate password strength
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg:
        "Password must be 8+ chars with uppercase, lowercase, number, special character"
      });
    }


    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        msg: "Email already registered"
      });
    }


    // hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(password, salt);


    // create user
    const user = await User.create({

      name,

      email,

      password: hashedPassword

    });


    // generate token
    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      JWT_SECRET,

      {
        expiresIn: "2h"
      }

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

  }

  catch (err) {

    console.error("Signup Error:", err);

    res.status(500).json({
      msg: "Server error"
    });

  }

});



/* LOGIN */

app.post("/auth/login", async (req, res) => {

  try {

    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "All fields required"
      });
    }


    // normalize email
    email = email.toLowerCase().trim();


    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid credentials"
      });
    }


    const isMatch =
      await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid credentials"
      });
    }


    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      JWT_SECRET,

      {
        expiresIn: "2h"
      }

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

  }

  catch (err) {

    console.error("Login Error:", err);

    res.status(500).json({
      msg: "Server error"
    });

  }

});


/* ================= AUTH MIDDLEWARE ================= */

const auth = (req, res, next) => {

  try {

    const header =
      req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        msg: "No token"
      });
    }


    const token =
      header.split(" ")[1];


    const decoded =
      jwt.verify(token, JWT_SECRET);


    req.userId =
      decoded.id;


    next();

  }

  catch {

    return res.status(401).json({
      msg: "Invalid token"
    });

  }

};



/* ================= CHAT ROUTES ================= */


/* SAVE CHAT */

app.post("/chat/save", auth, async (req, res) => {

  try {

    const { chatId, messages } = req.body;

    const firstMsg =
      messages.find(m => m.sender === "user");


    const title =
      firstMsg
        ? firstMsg.text.slice(0, 40)
        : "New Chat";


    const existing =
      await Chat.findOne({

        userId: req.userId,

        chatId

      });


    if (existing) {

      existing.messages = messages;

      existing.title = title;

      await existing.save();

    }

    else {

      await Chat.create({

        userId: req.userId,

        chatId,

        title,

        messages

      });

    }


    res.json({
      msg: "Chat saved"
    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Server error"
    });

  }

});


/* LIST CHATS */

app.get("/chat/list", auth, async (req, res) => {

  const chats =
    await Chat.find({

      userId: req.userId

    }).sort({

      createdAt: -1

    });


  res.json(chats);

});


/* LOAD CHAT */

app.get("/chat/:chatId", auth, async (req, res) => {

  const chat =
    await Chat.findOne({

      userId: req.userId,

      chatId: req.params.chatId

    });


  if (!chat) {
    return res.status(404).json({
      msg: "Chat not found"
    });
  }


  res.json(chat);

});


/* DELETE CHAT */

app.delete("/chat/:chatId", auth, async (req, res) => {

  await Chat.deleteOne({

    userId: req.userId,

    chatId: req.params.chatId

  });


  res.json({
    msg: "Chat deleted"
  });

});
/* ================= AI INTEGRATION ================= */


/* NORMAL ANALYSIS */

app.post("/api/analyze-case", async (req, res) => {

  try {

    const { case_description } = req.body;

    if (!case_description) {

      return res.status(400).json({
        success: false,
        message: "Case description is required"
      });

    }


    const response = await axios.post(

      "http://localhost:8000/analyze",

      {
        case_description
      },

      {
        timeout: 120000
      }

    );


    res.json({

      success: true,

      analysis: response.data

    });

  }

  catch (error) {

    console.error("AI Error:", error.message);

    res.status(500).json({

      success: false,

      message: "AI analysis failed"

    });

  }

});



/* STREAMING ANALYSIS */

app.post("/api/analyze-case-stream", async (req, res) => {

  try {

    const { case_description } = req.body;

    if (!case_description) {

      return res.status(400).send(
        "Case description required"
      );

    }


    res.setHeader(
      "Content-Type",
      "text/plain"
    );

    res.setHeader(
      "Transfer-Encoding",
      "chunked"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );


    const response = await axios.post(

      "http://localhost:8000/analyze-stream",

      {
        case_description
      },

      {
        responseType: "stream",
        timeout: 0
      }

    );


    response.data.on("data", chunk => {

      res.write(
        chunk.toString()
      );

    });


    response.data.on("end", () => {

      res.end();

    });


    response.data.on("error", err => {

      console.error("Stream error:", err);

      res.end();

    });

  }

  catch (error) {

    console.error("Streaming Error:", error.message);

    res.status(500).end(
      "Streaming failed"
    );

  }

});


/* ================= START SERVER ================= */

app.listen(PORT, () => {

  console.log(`🔥 Server running on http://localhost:${PORT}`);

});