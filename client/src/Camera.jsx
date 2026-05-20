import { useRef, useState, useImperativeHandle, forwardRef } from "react"

const Camera = forwardRef(function Camera({ onCapture }, ref) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [active, setActive] = useState(false)

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
    videoRef.current.play()
    setActive(true)
  }

  function captureFrame() {
    if (!active) return null
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    const base64 = canvas.toDataURL("image/jpeg", 0.75).split(",")[1]
    onCapture(base64)
    return base64
  }

  useImperativeHandle(ref, () => ({ captureFrame }))

  return (
    <div className="camera">
      <video ref={videoRef} className="video" muted />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="cam-btns">
        {!active
          ? <button onClick={startCamera}>Start Camera</button>
          : <span style={{ fontSize: "11px", color: "rgba(0,212,255,0.4)" }}>📷 Camera active — auto captures on send</span>
        }
      </div>
    </div>
  )
})

export default Camera