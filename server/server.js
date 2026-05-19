const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "10mb" }))

app.post("/api/chat", async (req, res) => {
  const { message, imageBase64 } = req.body

  const parts = []

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    })
  }

  parts.push({ text: message })

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          systemInstruction: {
            parts: [{
              text: "You are EMO — a friendly, emotionally intelligent AI companion. Be concise, warm and witty."
            }]
          }
        })
      }
    )

    const data = await response.json()
    if (!response.ok || data.error) {
      console.error("Gemini API Error:", data.error || data);
    }
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "..."
    res.json({ reply })

  } catch (err) {
    console.error(err)
    res.status(500).json({ reply: "Something went wrong." })
  }
})

app.listen(process.env.PORT, () => {
  console.log(`EMO server running on port ${process.env.PORT}`)
})