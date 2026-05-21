const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const Conversation = require("./models/Conversation")
const User = require("./models/User")

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "10mb" }))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err))

// Save message to DB
async function saveMessage(sessionId, role, text) {
  await Conversation.findOneAndUpdate(
    { sessionId },
    {
      $push: { messages: { role, text } },
      $set: { updatedAt: Date.now() }
    },
    { upsert: true, returnDocument: "after" }
  )
}

// Chat route
app.post("/api/chat", async (req, res) => {
  const { message, imageBase64, history, sessionId } = req.body

  // Save user message to DB
  await saveMessage(sessionId, "user", message)

  const contents = []

  if (history && history.length > 0) {
    history.forEach(msg => {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      })
    })
  }

  const currentParts = []
  if (imageBase64) {
    currentParts.push({
      inlineData: { mimeType: "image/jpeg", data: imageBase64 }
    })
  }
  currentParts.push({ text: message })
  contents.push({ role: "user", parts: currentParts })

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{
              text: "You are EMO — a friendly, emotionally intelligent AI companion. Be concise, warm and witty. Keep replies short — 1 to 3 sentences max."
            }]
          }
        })
      }
    )

    if (!response.ok) {
      const err = await response.json()
      console.error("Gemini API Error:", err.error)
      return res.status(500).json({ reply: "Something went wrong." })
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "..."

    // Save EMO reply to DB
    await saveMessage(sessionId, "emo", reply)

    res.json({ reply })

  } catch (err) {
    console.error(err)
    res.status(500).json({ reply: "Something went wrong." })
  }
})

// Get conversation history from DB
app.get("/api/history/:sessionId", async (req, res) => {
  const conversation = await Conversation.findOne({ sessionId: req.params.sessionId })
  res.json({ messages: conversation?.messages || [] })
})

// Save user preferences
app.post("/api/user", async (req, res) => {
  const { sessionId, name, language } = req.body
  const user = await User.findOneAndUpdate(
    { sessionId },
    { name, language },
    { upsert: true, new: true }
  )
  res.json(user)
})

// Get user preferences
app.get("/api/user/:sessionId", async (req, res) => {
  const user = await User.findOne({ sessionId: req.params.sessionId })
  res.json(user || {})
})

app.listen(process.env.PORT || 5000, () => {
  console.log(`EMO server running on port ${process.env.PORT || 5000}`)
})