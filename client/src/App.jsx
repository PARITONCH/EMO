import { useState, useRef, useEffect } from "react"
import Camera from "./Camera"
import FileUpload from "./FileUpload"
import { useVoice } from "./useVoice"

const SESSION_ID = "user_" + Math.random().toString(36).substr(2, 9)
const API_URL = "https://emo-server-yadc.onrender.com"

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [frame, setFrame] = useState(null)
  const [loading, setLoading] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState(-1)
  const [speakingWord, setSpeakingWord] = useState("")
  const [uploadedFile, setUploadedFile] = useState(null)
  const cameraRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  function speak(text, msgIndex) {
    const words = text.split(" ")
    let wordIndex = 0

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        setSpeakingIndex(msgIndex)
        setSpeakingWord(words[wordIndex])
        wordIndex++
      }
    }

    utterance.onend = () => {
      setSpeakingIndex(-1)
      setSpeakingWord("")
    }

    window.speechSynthesis.speak(utterance)
  }

  async function sendMessage(voiceText) {
    const textToSend = voiceText || input
    if (!textToSend.trim() || loading) return

    setLoading(true)
    setInput("")

    if (uploadedFile) {
      const userMsg = { role: "user", text: `📎 ${uploadedFile.name}: ${textToSend}` }
      setMessages(prev => [...prev, userMsg])

      try {
        const res = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64: uploadedFile.base64,
            type: uploadedFile.type,
            mimeType: uploadedFile.mimeType,
            name: uploadedFile.name,
            question: textToSend,
            sessionId: SESSION_ID
          })
        })

        const data = await res.json()
        const reply = data.reply
        const newIndex = messages.length + 1
        setMessages(prev => [...prev, { role: "emo", text: reply }])
        speak(reply, newIndex)
        setUploadedFile(null)
      } catch (err) {
        setMessages(prev => [...prev, { role: "emo", text: "Connection error." }])
      } finally {
        setLoading(false)
      }
      return
    }

    let capturedFrame = null
    if (cameraRef.current) {
      capturedFrame = cameraRef.current.captureFrame()
    }

    const userMsg = { role: "user", text: textToSend }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          imageBase64: capturedFrame,
          history: messages,
          sessionId: SESSION_ID
        })
      })

      const data = await res.json()
      const reply = data.reply
      const newIndex = messages.length + 1
      setMessages(prev => [...prev, { role: "emo", text: reply }])
      speak(reply, newIndex)
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

      <Camera ref={cameraRef} onCapture={handleCapture} />

      <FileUpload onFileSelect={setUploadedFile} />

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
            <div>
              {msg.role === "emo" && speakingIndex === i
                ? msg.text.split(" ").map((word, wi) => (
                    <span
                      key={wi}
                      style={{
                        color: word === speakingWord ? "#ffffff" : "inherit",
                        textShadow: word === speakingWord
                          ? "0 0 12px rgba(255,220,100,1)"
                          : "none",
                        fontWeight: word === speakingWord ? "700" : "inherit",
                        transition: "all 0.1s ease"
                      }}
                    >
                      {word}{" "}
                    </span>
                  ))
                : msg.text
              }
            </div>
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
          placeholder={uploadedFile ? "Ask about the file..." : "Talk to EMO..."}
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