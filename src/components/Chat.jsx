import { useState, useRef, useEffect } from 'react'
import { Send, Upload, Loader, File, X, CheckCircle, AlertCircle, Bot, User, HelpCircle, FileText, MessageSquare, Copy, Download } from 'lucide-react'
import './Chat.css'
import { uploadFile, askQuestion, summarizeDocument, generateQuiz } from '../services/api'
import { extractTextFromPDF, extractAndSummarizePDF } from '../utils/pdfParser'

function Chat({ uploadedFiles, setUploadedFiles }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'assistant',
      content: "Hello! I'm your Smart Campus Assistant. 👋\n\nI can help you with:\n\n• **Ask questions** about your course materials\n• **Summarize documents** - just say 'summarize [filename]' or 'give me a summary'\n• **Generate practice quizzes** - try 'create a quiz with 5 questions'\n• **Upload files** by dragging and dropping or using the upload button\n\n**Try it now:** Upload a PDF and ask me to summarize it!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  // Detect intent from user message
  const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Check for summarize intent
    if (
      lowerMessage.includes('summarize') || 
      lowerMessage.includes('summary') || 
      lowerMessage.includes('summarise') ||
      lowerMessage.includes('summarize this') ||
      lowerMessage.includes('give me a summary') ||
      lowerMessage.includes('can you summarize')
    ) {
      return { type: 'summarize', message }
    }
    
    // Check for quiz intent
    if (
      lowerMessage.includes('quiz') || 
      lowerMessage.includes('practice') || 
      lowerMessage.includes('test') || 
      lowerMessage.includes('questions') ||
      lowerMessage.includes('generate quiz') ||
      lowerMessage.includes('create quiz') ||
      lowerMessage.includes('make a quiz') ||
      lowerMessage.includes('give me questions') ||
      lowerMessage.includes('important questions')
    ) {
      const numMatch = message.match(/(\d+)\s*(?:questions?|qns?|qs)/i)
      const numQuestions = numMatch ? parseInt(numMatch[1]) : 5
      // Ensure reasonable limits
      const finalNum = Math.min(Math.max(numQuestions, 3), 20)
      return { type: 'quiz', message, numQuestions: finalNum }
    }
    
    // Default to Q&A
    return { type: 'qa', message }
  }

  // Extract filename from message if mentioned
  const extractFilename = (message, files) => {
    for (const file of files) {
      if (message.toLowerCase().includes(file.file.name.toLowerCase())) {
        return file
      }
    }
    return files.length > 0 ? files[0] : null
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])

    // Detect intent
    const intent = detectIntent(userMessage)
    setLoading(true)

    try {
      if (intent.type === 'summarize') {
        if (uploadedFiles.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + '_error',
              type: 'assistant',
              content: "I don't see any uploaded files. Please upload a document first, then ask me to summarize it.",
              timestamp: new Date(),
            },
          ])
          return
        }

        const fileToSummarize = extractFilename(userMessage, uploadedFiles)
        
        // Check if it's a PDF file
        if (fileToSummarize.file.type === 'application/pdf' || fileToSummarize.file.name.endsWith('.pdf')) {
          // Extract and summarize actual PDF content
          const { fullText, summary, pageCount } = await extractAndSummarizePDF(fileToSummarize.file)
          
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'assistant',
              content: `**Summary of ${fileToSummarize.file.name}** (${pageCount} pages):\n\n${summary}\n\n---\n\n*Full document extracted ${fullText.length} characters. You can ask me specific questions about the content.*`,
              timestamp: new Date(),
              file: fileToSummarize,
              pdfContent: fullText, // Store full text for Q&A
            },
          ])
          
          // Update uploaded file with extracted content
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file.name === fileToSummarize.file.name
                ? { ...f, extractedText: fullText }
                : f
            )
          )
        } else {
          // For non-PDF files, use API
          const response = await summarizeDocument(fileToSummarize)
          
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'assistant',
              content: `**Summary of ${fileToSummarize.file.name}:**\n\n${response.summary}`,
              timestamp: new Date(),
              file: fileToSummarize,
            },
          ])
        }
      } else if (intent.type === 'quiz') {
        if (uploadedFiles.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + '_error',
              type: 'assistant',
              content: "I don't see any uploaded files. Please upload course materials first, then ask me to create a quiz.",
              timestamp: new Date(),
            },
          ])
          return
        }

        const response = await generateQuiz(uploadedFiles, intent.numQuestions)
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'assistant',
            content: `I've generated a practice quiz with ${intent.numQuestions} questions based on your materials.`,
            timestamp: new Date(),
            quiz: response.quiz,
          },
        ])
      } else {
        // Q&A
        if (uploadedFiles.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + '_error',
              type: 'assistant',
              content: "I don't see any uploaded files. Please upload course materials first, then ask me questions about them.",
              timestamp: new Date(),
            },
          ])
          return
        }

        // Check if we have extracted PDF text
        const filesWithText = uploadedFiles.filter(f => f.extractedText)
        if (filesWithText.length > 0) {
          // Use extracted text for better answers
          const allText = filesWithText.map(f => f.extractedText).join('\n\n')
          const relevantText = findRelevantText(userMessage, allText)
          
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'assistant',
              content: `Based on your uploaded materials:\n\n${relevantText || 'I found the document, but couldn\'t find specific information about your question. Could you rephrase it?'}`,
              timestamp: new Date(),
            },
          ])
        } else {
          const response = await askQuestion(userMessage, uploadedFiles)
          
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'assistant',
              content: response.answer,
              timestamp: new Date(),
            },
          ])
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_error',
          type: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files) => {
    const validFiles = Array.from(files).filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.type.includes('document') ||
        file.type.includes('presentation') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.pptx')
    )

    if (validFiles.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_error',
          type: 'assistant',
          content: 'Please upload PDF, DOCX, or PPTX files only.',
          timestamp: new Date(),
        },
      ])
      return
    }

    for (const file of validFiles) {
      setUploading(true)
      try {
        const result = await uploadFile(file)
        let extractedText = null
        let pageCount = 0
        
        // Extract text from PDF files automatically
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          try {
            const pdfData = await extractAndSummarizePDF(file)
            extractedText = pdfData.fullText
            pageCount = pdfData.pageCount
          } catch (pdfError) {
            console.warn('PDF extraction failed:', pdfError)
          }
        }
        
        const newFile = { ...result, file, extractedText }
        setUploadedFiles((prev) => [...prev, newFile])
        
        const uploadMessage = extractedText
          ? `✅ Successfully uploaded: **${file.name}** (${pageCount} pages)\n\n📄 PDF content extracted! You can now:\n• Ask questions about the content\n• Request a summary\n• Generate practice quizzes`
          : `✅ Successfully uploaded: **${file.name}**\n\nYou can now ask me questions about it, request a summary, or generate a quiz!`
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'assistant',
            content: uploadMessage,
            timestamp: new Date(),
            file: newFile,
          },
        ])
      } catch (error) {
        console.error('Upload error:', error)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '_error',
            type: 'assistant',
            content: `❌ Failed to upload: ${file.name}`,
            timestamp: new Date(),
          },
        ])
      } finally {
        setUploading(false)
      }
    }
  }

  const handleFileSelect = (e) => {
    handleFileUpload(e.target.files)
    e.target.value = '' // Reset input
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeFile = (fileName) => {
    setUploadedFiles((prev) => prev.filter((f) => f.file.name !== fileName))
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Removed: ${fileName}`,
        timestamp: new Date(),
      },
    ])
  }

  // Find relevant text from document based on question
  const findRelevantText = (question, text) => {
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
    
    // Score sentences based on keyword matches
    const scoredSentences = sentences.map(sentence => {
      const lowerSentence = sentence.toLowerCase()
      const score = questionWords.reduce((acc, word) => {
        return acc + (lowerSentence.includes(word) ? 1 : 0)
      }, 0)
      return { sentence: sentence.trim(), score }
    })
    
    // Get top 3-5 relevant sentences
    const relevant = scoredSentences
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.sentence)
      .join('. ') + '.'
    
    return relevant || text.substring(0, 500) + '...'
  }

  const formatMessage = (content) => {
    // Enhanced markdown-like formatting
    const lines = content.split('\n')
    const elements = []
    
    lines.forEach((line, i) => {
      if (line.trim() === '') {
        elements.push(<br key={`br-${i}`} />)
        return
      }
      
      // Bold text **text**
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g)
        elements.push(
          <span key={i}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>
              }
              return <span key={j}>{part}</span>
            })}
            <br />
          </span>
        )
        return
      }
      
      // Headers
      if (line.startsWith('###')) {
        elements.push(<h3 key={i} className="message-h3">{line.slice(3).trim()}</h3>)
        return
      }
      if (line.startsWith('##')) {
        elements.push(<h2 key={i} className="message-h2">{line.slice(2).trim()}</h2>)
        return
      }
      if (line.startsWith('#')) {
        elements.push(<h1 key={i} className="message-h1">{line.slice(1).trim()}</h1>)
        return
      }
      
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        elements.push(<div key={i} className="message-bullet">{line.trim()}</div>)
        return
      }
      
      // Regular line
      elements.push(<span key={i}>{line}<br /></span>)
    })
    
    return elements
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show toast or feedback
    })
  }

  const downloadText = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-section">
          <h3>Uploaded Files</h3>
          {uploadedFiles.length === 0 ? (
            <p className="empty-files">No files uploaded yet</p>
          ) : (
            <div className="files-list">
              {uploadedFiles.map((item, index) => (
                <div key={index} className="file-item-small">
                  <File size={16} />
                  <span className="file-name-small" title={item.file.name}>
                    {item.file.name}
                  </span>
                  <button
                    onClick={() => removeFile(item.file.name)}
                    className="remove-file-btn"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="quick-action-btn"
              disabled={uploading}
            >
              <Upload size={18} />
              Upload Files
            </button>
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div
          className="messages-container"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? (
                  <User size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>
              <div className="message-content">
                {message.type === 'assistant' && message.quiz ? (
                  <QuizDisplay quiz={message.quiz} />
                ) : (
                  <>
                    <div className="message-text">{formatMessage(message.content)}</div>
                    {message.type === 'assistant' && message.content && (
                      <div className="message-actions">
                        <button
                          onClick={() => copyToClipboard(message.content.replace(/\*\*/g, ''))}
                          className="message-action-btn"
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        {message.pdfContent && (
                          <button
                            onClick={() => downloadText(message.pdfContent, `summary_${message.file?.file?.name || 'document'}.txt`)}
                            className="message-action-btn"
                            title="Download full content"
                          >
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
                {message.file && (
                  <div className="message-file">
                    <File size={16} />
                    <span>{message.file.file.name}</span>
                  </div>
                )}
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <Loader className="spinner-icon" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-container">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileSelect}
            className="file-input-hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="upload-button"
            title="Upload files"
            disabled={uploading}
          >
            <Upload size={20} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
            placeholder="Message Smart Campus Assistant..."
            className="chat-input"
            disabled={loading}
            rows={1}
            style={{
              resize: 'none',
              minHeight: '44px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <Loader className="spinner-icon" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

// Quiz Display Component
function QuizDisplay({ quiz }) {
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const getScore = () => {
    let correct = 0
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  return (
    <div className="quiz-display">
      <div className="quiz-header-display">
        <HelpCircle size={20} />
        <span>Practice Quiz ({quiz.questions.length} questions)</span>
      </div>
      <div className="quiz-questions">
        {quiz.questions.map((question, index) => {
          const isCorrect = answers[question.id] === question.correctAnswer
          const showAnswer = showResults

          return (
            <div
              key={question.id}
              className={`quiz-question-card ${showAnswer ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
            >
              <div className="quiz-question-number">Q{index + 1}</div>
              <div className="quiz-question-text">{question.question}</div>
              <div className="quiz-options">
                {question.options.map((option, optIndex) => {
                  const isSelected = answers[question.id] === option
                  const isCorrectOption = option === question.correctAnswer

                  return (
                    <label
                      key={optIndex}
                      className={`quiz-option ${isSelected ? 'selected' : ''} ${showAnswer && isCorrectOption ? 'correct-answer' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`quiz-${question.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(question.id, option)}
                        disabled={showResults}
                      />
                      <span>{option}</span>
                  {showAnswer && isCorrectOption && (
                    <CheckCircle className="correct-icon" size={16} />
                  )}
                  {showAnswer && isSelected && !isCorrectOption && (
                    <XCircle className="incorrect-icon" size={16} />
                  )}
                    </label>
                  )
                })}
              </div>
              {showAnswer && (
                <div className="quiz-explanation">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {!showResults ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < quiz.questions.length}
          className="submit-quiz-btn"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="quiz-results">
          <div className="quiz-score">
            Score: {getScore()} / {quiz.questions.length} ({Math.round((getScore() / quiz.questions.length) * 100)}%)
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat

