import { useState, useRef } from "react"

function PiP({ onSend, messages, loading }) {
  const [input, setInput] = useState("")
  const pipWindowRef = useRef(null)
  const [pipActive, setPipActive] = useState(false)

  if (/Mobi|Android/i.test(navigator.userAgent)) return null

  async function openPiP() {
    if (!window.documentPictureInPicture) {
      alert("Picture-in-Picture is only supported in Chrome 116+")
      return
    }

    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 340,
      height: 480
    })

    pipWindowRef.current = pipWindow

    const style = pipWindow.document.createElement("style")
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: #020408;
        color: #00d4ff;
        font-family: monospace;
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 12px;
        gap: 10px;
      }
      h2 {
        text-align: center;
        letter-spacing: 8px;
        font-size: 18px;
        color: #00d4ff;
        text-shadow: 0 0 10px rgba(0,212,255,0.5);
      }
      .messages {
        flex: 1;
        overflow-y: auto;
        border: 1px solid rgba(0,212,255,0.15);
        border-radius: 4px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: rgba(0,20,35,0.9);
        scrollbar-width: thin;
      }
      .msg {
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 90%;
        line-height: 1.4;
        word-break: break-word;
      }
      .msg.user {
        background: rgba(0,212,255,0.08);
        border: 1px solid rgba(0,212,255,0.2);
        color: rgba(0,212,255,0.9);
        align-self: flex-end;
      }
      .msg.emo {
        background: rgba(255,200,0,0.05);
        border: 1px solid rgba(255,200,0,0.15);
        color: rgba(255,220,100,0.9);
        align-self: flex-start;
      }
      .role {
        font-size: 9px;
        opacity: 0.4;
        margin-bottom: 3px;
      }
      .thinking {
        font-size: 12px;
        color: rgba(255,220,100,0.5);
        padding: 6px 10px;
      }
      .input-row {
        display: flex;
        gap: 6px;
      }
      input {
        flex: 1;
        background: rgba(0,212,255,0.04);
        border: 1px solid rgba(0,212,255,0.2);
        color: #00d4ff;
        padding: 8px 10px;
        font-family: monospace;
        font-size: 12px;
        outline: none;
        border-radius: 4px;
      }
      button {
        background: rgba(0,212,255,0.06);
        border: 1px solid rgba(0,212,255,0.3);
        color: #00d4ff;
        padding: 8px 12px;
        font-family: monospace;
        font-size: 12px;
        cursor: pointer;
        border-radius: 4px;
      }
      button:hover { background: rgba(0,212,255,0.15); }
    `
    pipWindow.document.head.appendChild(style)

    pipWindow.document.body.innerHTML = `
      <h2>E M O</h2>
      <div class="messages" id="pip-messages"></div>
      <div class="input-row">
        <input id="pip-input" placeholder="Talk to EMO..." />
        <button id="pip-send">Send</button>
      </div>
    `

    function renderMessages(msgs, isLoading) {
      const container = pipWindow.document.getElementById("pip-messages")
      if (!container) return
      container.innerHTML = msgs.map(m => `
        <div class="msg ${m.role}">
          <div class="role">${m.role === "user" ? "YOU" : "EMO"}</div>
          ${m.text}
        </div>
      `).join("")
      if (isLoading) {
        container.innerHTML += `<div class="thinking">EMO is thinking...</div>`
      }
      container.scrollTop = container.scrollHeight
    }

    renderMessages(messages, loading)

    pipWindow.document.getElementById("pip-send").addEventListener("click", () => {
      const val = pipWindow.document.getElementById("pip-input").value
      if (val.trim()) {
        onSend(val)
        pipWindow.document.getElementById("pip-input").value = ""
      }
    })

    pipWindow.document.getElementById("pip-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = pipWindow.document.getElementById("pip-input").value
        if (val.trim()) {
          onSend(val)
          pipWindow.document.getElementById("pip-input").value = ""
        }
      }
    })

    pipWindow.addEventListener("pagehide", () => {
      setPipActive(false)
      pipWindowRef.current = null
    })

    setPipActive(true)
    pipWindowRef.current.renderMessages = renderMessages
  }

  if (pipWindowRef.current?.renderMessages) {
    pipWindowRef.current.renderMessages(messages, loading)
  }

  return (
    <button
      onClick={pipActive ? () => {
        pipWindowRef.current?.close()
        setPipActive(false)
      } : openPiP}
      style={{
        width: "100%",
        borderColor: pipActive ? "rgba(255,60,80,0.4)" : "rgba(0,212,255,0.3)",
        color: pipActive ? "#ff4455" : "#00d4ff"
      }}
    >
      {pipActive ? "✕ Close Floating EMO" : "⧉ Float EMO (PiP)"}
    </button>
  )
}

export default PiP