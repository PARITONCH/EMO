import { useState } from "react"

function FileUpload({ onFileSelect }) {
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState("")

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(",")[1]
      const isImage = file.type.startsWith("image/")
      const isPDF = file.type === "application/pdf"

      if (isImage) setPreview(reader.result)
      else setPreview(null)

      onFileSelect({
        base64,
        type: isImage ? "image" : isPDF ? "pdf" : "text",
        mimeType: file.type,
        name: file.name
      })
    }
    reader.readAsDataURL(file)
  }

  function clearFile() {
    setPreview(null)
    setFileName("")
    onFileSelect(null)
  }

  return (
    <div className="file-upload">
      <label className="file-label">
        📎 Attach File
        <input
          type="file"
          accept="image/*,.pdf,.txt"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </label>

      {fileName && (
        <div className="file-info">
          <span>{fileName}</span>
          <button onClick={clearFile} style={{
            padding: "2px 8px",
            fontSize: "11px",
            borderColor: "rgba(255,60,80,0.4)",
            color: "#ff4455"
          }}>✕</button>
        </div>
      )}

      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{
            width: "100%",
            maxHeight: "120px",
            objectFit: "cover",
            borderRadius: "4px",
            border: "1px solid rgba(0,212,255,0.2)",
            marginTop: "6px"
          }}
        />
      )}
    </div>
  )
}

export default FileUpload