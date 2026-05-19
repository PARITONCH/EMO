import { useState } from "react"
import Camera from "./Camera"
import { useVoice } from "./useVoice"

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [frame, setFrame] = useState(null)
  const [loading, setLoading] = useState(false)

  const { listening, startListening } = useVoice((text) => {
    setInput(text)
  })

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg = { role: "user", text: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          imageBase64: frame
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

  function handleCapture(base64) {
    setFrame(base64)
  }

  return (
    <div className="container">
      <h1>EMO</h1>

      <Camera onCapture={handleCapture} />

      {frame && (
        <div style={{ fontSize: "11px", color: "rgba(0,212,255,0.4)" }}>
          ✓ Frame ready — will be sent with next message
        </div>
      )}

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
      </div>

      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Talk to EMO..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
        <button onClick={startListening}>
          {listening ? "🔴 Listening..." : "🎤 Speak"}
        </button>
      </div>
    </div>
  )
}

export default App