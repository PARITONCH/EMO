import { useState, useRef, useEffect } from "react"
import Camera from "./Camera"
import { useVoice } from "./useVoice"

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [frame, setFrame] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentWord, setCurrentWord] = useState("")
  const cameraRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  function speak(text) {
    const words = text.split(" ")
    let wordIndex = 0

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        wordIndex++
        setCurrentWord(words[wordIndex - 1])
      }
    }

    utterance.onend = () => {
      setCurrentWord("")
    }

    window.speechSynthesis.speak(utterance)
  }

  async function sendMessage(voiceText) {
    const textToSend = voiceText || input
    if (!textToSend.trim() || loading) return

    let currentFrame = frame
    if (cameraRef.current) {
      cameraRef.current.captureFrame()
      currentFrame = frame
    }

    const userMsg = { role: "user", text: textToSend }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          imageBase64: currentFrame,
          history: messages
        })
      })

      const data = await res.json()
      const reply = data.reply
      setMessages(prev => [...prev, { role: "emo", text: reply }])
      speak(reply)
    } catch (err) {
      setMessages(prev => [...prev, { role: "emo", text: "Connection error." }])
    } finally {
      setLoading(false)
      setFrame(null)
    }
  }

  const { listening, startListening } = useVoice((text) => {
    setInput(text)
    setTimeout(() => sendMessage(text), 100)
  })

  function handleCapture(base64) {
    setFrame(base64)
  }

  return (
    <div className="container">
      <h1>EMO</h1>

      {currentWord && (
        <div style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "700",
          color: "#00d4ff",
          letterSpacing: "4px",
          textShadow: "0 0 20px rgba(0,212,255,0.8)",
          animation: "fadeIn 0.1s ease",
          minHeight: "40px"
        }}>
          {currentWord}
        </div>
      )}

      <Camera ref={cameraRef} onCapture={handleCapture} />

      <div className="messages">
        {messages.length === 0 && (
          <div style={{ color: "rgba(0,212,255,0.2)", textAlign: "center", marginTop: "40px" }}>
            Say something to EMO...
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <div style={{ fontSize: "10px", opacity: 0.4, marginBottom: "4px" }}>
              {msg.role === "user" ? "YOU" : "EMO"}
            </div>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="msg emo" style={{ opacity: 0.5 }}>
            EMO is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Talk to EMO..."
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
        <button onClick={startListening} disabled={loading}>
          {listening ? "🔴 Listening..." : "🎤 Speak"}
        </button>
      </div>
    </div>
  )
}

export default App