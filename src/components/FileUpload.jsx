import { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import './FileUpload.css'
import { uploadFile } from '../services/api'

function FileUpload({ uploadedFiles, setUploadedFiles }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({})

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      await processFiles(files)
    },
    []
  )

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files)
    await processFiles(files)
  }, [])

  const processFiles = async (files) => {
    const validFiles = files.filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.type.includes('document') ||
        file.type.includes('presentation') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.pptx')
    )

    if (validFiles.length === 0) {
      alert('Please upload PDF, DOCX, or PPTX files only.')
      return
    }

    for (const file of validFiles) {
      setUploading(true)
      setUploadStatus((prev) => ({ ...prev, [file.name]: 'uploading' }))

      try {
        const result = await uploadFile(file)
        setUploadedFiles((prev) => [...prev, { ...result, file }])
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'success' }))
      } catch (error) {
        console.error('Upload error:', error)
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }))
      } finally {
        setUploading(false)
      }
    }
  }

  const removeFile = (fileName) => {
    setUploadedFiles((prev) => prev.filter((f) => f.file.name !== fileName))
    setUploadStatus((prev) => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
  }

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) return '📄'
    if (fileName.endsWith('.docx')) return '📝'
    if (fileName.endsWith('.pptx')) return '📊'
    return '📎'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={48} className="upload-icon" />
          <h2>Upload Course Materials</h2>
          <p>Drag and drop your files here, or click to browse</p>
          <p className="upload-hint">Supports PDF, DOCX, and PPTX files</p>
          <input
            type="file"
            id="file-input"
            multiple
            accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="file-input" className="browse-button">
            Browse Files
          </label>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h3>Uploaded Materials ({uploadedFiles.length})</h3>
          <div className="files-list">
            {uploadedFiles.map((item, index) => {
              const status = uploadStatus[item.file.name] || 'success'
              return (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(item.file.name)}</span>
                    <div className="file-details">
                      <p className="file-name">{item.file.name}</p>
                      <p className="file-size">{formatFileSize(item.file.size)}</p>
                    </div>
                  </div>
                  <div className="file-actions">
                    {status === 'uploading' && (
                      <div className="status-badge uploading">
                        <div className="spinner"></div>
                        Uploading...
                      </div>
                    )}
                    {status === 'success' && (
                      <div className="status-badge success">
                        <CheckCircle size={16} />
                        Uploaded
                      </div>
                    )}
                    {status === 'error' && (
                      <div className="status-badge error">
                        <AlertCircle size={16} />
                        Error
                      </div>
                    )}
                    <button
                      className="remove-button"
                      onClick={() => removeFile(item.file.name)}
                      title="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload



