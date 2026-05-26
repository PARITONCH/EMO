# EMO

EMO is an AI assistant I built from scratch. You talk to it, it talks back. You show it something on camera, it tells you what it sees. You upload a PDF, it reads it. It remembers what you said earlier in the conversation.

🔗 **Live:** https://emo-rho.vercel.app/

---

## Why I built this

I wanted to build something that felt like a real product, not just another todo app. The idea was simple — what if you could have a conversation with an AI that could actually see what you're doing? So I built it.

---

## What it does

- **Voice** — click the mic, speak, EMO replies out loud. Each word glows in the chat as it speaks.
- **Camera** — EMO captures a frame from your webcam with every message. Ask it what you're holding and it'll tell you.
- **File upload** — drop in an image or a PDF and ask questions about it. Works for resumes, notes, anything.
- **Memory** — EMO remembers the conversation as long as the session is active. Every message gets saved to MongoDB.

---

## Stack

- React + Vite (frontend)
- Node.js + Express (backend)
- Google Gemini 2.5 Flash (AI — handles both text and images)
- MongoDB Atlas (database)
- Web Speech API (voice in and out, built into Chrome)
- getUserMedia + Canvas API (webcam)
- Deployed on Vercel (frontend) + Render (backend)

---

## Run it locally

You need a Gemini API key from aistudio.google.com and a MongoDB Atlas connection string.

```bash
git clone https://github.com/PARITONCH/EMO.git
cd EMO

# backend
cd server
npm install
# create .env with GEMINI_API_KEY, MONGODB_URI, PORT=5000
node server.js

# frontend (new terminal)
cd client
npm install
npm run dev
```

---

## What I learned

This was my first time building a full-stack app that connected this many things together. The hardest parts were getting the webcam frame to sync correctly with the API call, and figuring out why the voice boundary events weren't firing consistently across browsers.

I also learned the hard way that API keys should never go in your code. Lost a couple hours debugging a mysteriously failing deployment before realising dotenv wasn't loading correctly on Render.

---

## What's next

- Login system so users have their own history
- Mobile UI
- Face detection without needing the AI API
- Local AI with Ollama so it works offline

---

## Author

Chingtham Pariton Singh
GitHub: https://github.com/PARITONCH
LinkedIn: linkedin.com/in/chingtham-pariton-singh-904485332
