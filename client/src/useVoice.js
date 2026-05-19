import { useState } from "react"

export function useVoice(onResult) {
  const [listening, setListening] = useState(false)

  function startListening() {
    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
    }

    recognition.start()
  }

  return { listening, startListening }
}