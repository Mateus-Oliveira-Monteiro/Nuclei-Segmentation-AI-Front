import { useState, useRef } from 'react'

const ALLOWED_EXTENSIONS = ['.tif', '.tiff', '.png', '.jpg', '.jpeg']
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export default function ImageUpload({ selectedFile, onFileSelect, disabled }) {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const fileInputRef = useRef(null)

  const validateAndSelectFile = (file) => {
    setValidationError(null)

    if (!file) return

    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(`Formato não suportado: ${ext}. Use TIFF, PNG ou JPG.`)
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`Arquivo muito grande (${formatBytes(file.size)}). Limite: 50 MB.`)
      return
    }

    onFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      validateAndSelectFile(file)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      validateAndSelectFile(file)
    }
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    onFileSelect(null)
    setValidationError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleZoneClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept=".tif,.tiff,.png,.jpg,.jpeg"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <div
        className={`dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
      >
        {!selectedFile ? (
          <div className="dropzone-content">
            <div className="upload-icon">📁</div>
            <p className="upload-main-text">
              <strong>Clique para escolher</strong> ou arraste sua imagem aqui
            </p>
            <p className="upload-sub-text">
              Formatos aceitos: <span>.tif, .tiff, .png, .jpg, .jpeg</span> (Máximo: 50 MB)
            </p>
          </div>
        ) : (
          <div className="file-info-card">
            <div className="file-icon">🔬</div>
            <div className="file-details">
              <span className="file-name" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="file-size">{formatBytes(selectedFile.size)}</span>
            </div>
            <button
              type="button"
              className="remove-file-btn"
              onClick={handleRemove}
              disabled={disabled}
              title="Remover arquivo"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {validationError && (
        <div className="validation-error">
          <span>⚠️</span> {validationError}
        </div>
      )}
    </div>
  )
}
