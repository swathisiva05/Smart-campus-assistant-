import { useState } from 'react'
import { Send, Loader, MessageSquare, AlertCircle } from 'lucide-react'
import './QnA.css'
import { askQuestion } from '../services/api'

function QnA({ uploadedFiles }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    if (uploadedFiles.length === 0) {
      setError('Please upload some course materials first.')
      return
    }

    setLoading(true)
    setError(null)
    setAnswer('')

    try {
      const response = await askQuestion(question, uploadedFiles)
      setAnswer(response.answer)
      setHistory((prev) => [
        ...prev,
        { question, answer: response.answer, timestamp: new Date() },
      ])
      setQuestion('')
    } catch (err) {
      setError('Failed to get answer. Please try again.')
      console.error('Q&A error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="qna-container">
      <div className="qna-header">
        <MessageSquare className="qna-icon" />
        <div>
          <h2>Ask Questions About Your Materials</h2>
          <p>Get instant answers from your uploaded course materials</p>
        </div>
      </div>

      {uploadedFiles.length === 0 && (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-icon" />
          <p>Upload course materials first to start asking questions</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="question-form">
        <div className="input-group">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your course materials... (e.g., 'What are the main concepts in chapter 3?')"
            className="question-input"
            rows="3"
            disabled={loading || uploadedFiles.length === 0}
          />
          <button
            type="submit"
            className="submit-button"
            disabled={loading || !question.trim() || uploadedFiles.length === 0}
          >
            {loading ? (
              <Loader className="spinner-icon" />
            ) : (
              <Send size={20} />
            )}
            <span>Ask</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <Loader className="spinner-icon large" />
          <p>Analyzing your materials and generating answer...</p>
        </div>
      )}

      {answer && (
        <div className="answer-section">
          <h3>Answer</h3>
          <div className="answer-content">{answer}</div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <h3>Recent Questions</h3>
          <div className="history-list">
            {history.slice(-5).reverse().map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-question">
                  <strong>Q:</strong> {item.question}
                </div>
                <div className="history-answer">
                  <strong>A:</strong> {item.answer.substring(0, 150)}
                  {item.answer.length > 150 && '...'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QnA



