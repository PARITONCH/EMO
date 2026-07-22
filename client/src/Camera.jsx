import { useRef, useState, useImperativeHandle, forwardRef } from "react"

const Camera = forwardRef(function Camera({ onCapture }, ref) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [active, setActive] = useState(false)
  const [mode, setMode] = useState("")
  const [facingMode, setFacingMode] = useState("user")
  const streamRef = useRef(null)

  const isMobile = /Mobi|Android/i.test(navigator.userAgent)

  async function startCamera(facing = "user") {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing }
      })
      streamRef.current = stream
      setMode("camera")
      setFacingMode(facing)
      setActive(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (err) {
      console.error("Camera error:", err)
    }
  }

  async function switchCamera() {
    const newFacing = facingMode === "user" ? "environment" : "user"
    await startCamera(newFacing)
  }

  async function startScreen() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false
      })
      streamRef.current = stream
      setMode("screen")
      setActive(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
      stream.getVideoTracks()[0].onended = () => stop()
    } catch (err) {
      console.error("Screen share error:", err)
    }
  }

  function stop() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActive(false)
    setMode("")
  }

  function captureFrame() {
    if (!active || !videoRef.current) return null
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    const base64 = canvas.toDataURL("image/jpeg", 0.75).split(",")[1]
    onCapture(base64)
    return base64
  }

  useImperativeHandle(ref, () => ({ captureFrame, active: () => active }))

  return (
    <div className="camera">
      <video
        ref={videoRef}
        className="video"
        muted
        playsInline
        style={{ display: active ? "block" : "none" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {active && (
        <div style={{ fontSize: "11px", color: "rgba(0,212,255,0.3)", textAlign: "center" }}>
          {mode === "camera" ? "● Camera active" : "● Screen sharing active"} — frame sent with every message
        </div>
      )}

      <div className="cam-btns">
        {!active ? (
          <>
            <button onClick={() => startCamera("user")}>📷 Camera</button>
            {!isMobile && (
              <button onClick={startScreen}>🖥️ Share Screen</button>
            )}
          </>
        ) : (
          <>
            {mode === "camera" && isMobile && (
              <button onClick={switchCamera}>
                {facingMode === "user" ? "🔄 Back Camera" : "🔄 Front Camera"}
              </button>
            )}
            <button onClick={stop} style={{ borderColor: "rgba(255,60,80,0.4)", color: "#ff4455" }}>
              ■ Stop {mode === "camera" ? "Camera" : "Screen"}
            </button>
          </>
        )}
      </div>
    </div>
  )
})

export default Camera