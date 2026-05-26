import { useRef, useState, useImperativeHandle, forwardRef } from "react"

const Camera = forwardRef(function Camera({ onCapture }, ref) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [active, setActive] = useState(false)
  const streamRef = useRef(null)

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    streamRef.current = stream
    videoRef.current.srcObject = stream
    videoRef.current.play()
    setActive(true)
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
      videoRef.current.srcObject = null
      setActive(false)
    }
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
      {active && (
        <>
          <video ref={videoRef} className="video" muted />
          <div style={{ fontSize: "11px", color: "rgba(0,212,255,0.3)", textAlign: "center" }}>
            ● Camera active — frame sent with every message
          </div>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
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