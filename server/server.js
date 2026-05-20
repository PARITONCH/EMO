const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "10mb" }))

app.post("/api/chat", async (req, res) => {
  const { message, imageBase64, history } = req.body

  // Build conversation history for Gemini
  const contents = []

  // Add past messages
  if (history && history.length > 0) {
    history.forEach(msg => {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      })
    })
  }

  // Add current message with optional image
  const currentParts = []
  if (imageBase64) {
    currentParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
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
    res.json({ reply })

  } catch (err) {
    console.error(err)
    res.status(500).json({ reply: "Something went wrong." })
  }
})

app.listen(process.env.PORT || 5000, () => {
  console.log(`EMO server running on port ${process.env.PORT || 5000}`)
})