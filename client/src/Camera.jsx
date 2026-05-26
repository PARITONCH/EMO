import { useRef, useState, useImperativeHandle, forwardRef } from "react"

const Camera = forwardRef(function Camera({ onCapture }, ref) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [active, setActive] = useState(false)
  const streamRef = useRef(null)

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setActive(true)
      // Wait for state + DOM update then attach stream
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

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActive(false)
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
          ● Camera active — frame sent with every message
        </div>
      )}

      <div className="cam-btns">
        {!active
          ? <button onClick={startCamera}>📷 Start Camera</button>
          : <button onClick={stopCamera} style={{ borderColor: "rgba(255,60,80,0.4)", color: "#ff4455" }}>■ Stop Camera</button>
        }
      </div>
    </div>
  )
})

export default Camera