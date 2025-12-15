import { useState } from 'react'
import { FileText, Loader, AlertCircle, Download } from 'lucide-react'
import './Summary.css'
import { summarizeDocument } from '../services/api'

function Summary({ uploadedFiles }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSummarize = async () => {
    if (!selectedFile) {
      setError('Please select a file to summarize')
      return
    }

    setLoading(true)
    setError(null)
    setSummary('')

    try {
      const response = await summarizeDocument(selectedFile)
      setSummary(response.summary)
    } catch (err) {
      setError('Failed to generate summary. Please try again.')
      console.error('Summary error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!summary) return

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary_${selectedFile?.file?.name || 'document'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="summary-container">
      <div className="summary-header">
        <FileText className="summary-icon" />
        <div>
          <h2>Document Summarization</h2>
          <p>Get concise summaries of your lecture notes and documents</p>
        </div>
      </div>

      {uploadedFiles.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-icon" />
          <p>Upload course materials first to generate summaries</p>
        </div>
      ) : (
        <>
          <div className="file-selector">
            <label htmlFor="file-select">Select a document to summarize:</label>
            <select
              id="file-select"
              value={selectedFile?.file?.name || ''}
              onChange={(e) => {
                const file = uploadedFiles.find(
                  (f) => f.file.name === e.target.value
                )
                setSelectedFile(file)
                setSummary('')
                setError(null)
              }}
              className="file-select"
            >
              <option value="">Choose a file...</option>
              {uploadedFiles.map((item, index) => (
                <option key={index} value={item.file.name}>
                  {item.file.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSummarize}
              disabled={!selectedFile || loading}
              className="summarize-button"
            >
              {loading ? (
                <>
                  <Loader className="spinner-icon" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <Loader className="spinner-icon large" />
              <p>Analyzing document and generating summary...</p>
            </div>
          )}

          {summary && (
            <div className="summary-section">
              <div className="summary-header-actions">
                <h3>Summary</h3>
                <button onClick={handleDownload} className="download-button">
                  <Download size={18} />
                  <span>Download</span>
                </button>
              </div>
              <div className="summary-content">{summary}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Summary



