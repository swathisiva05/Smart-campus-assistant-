import { useState } from 'react'
import { HelpCircle, Loader, AlertCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import './Quiz.css'
import { generateQuiz } from '../services/api'

function Quiz({ uploadedFiles }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [numQuestions, setNumQuestions] = useState(5)
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to generate a quiz')
      return
    }

    setLoading(true)
    setError(null)
    setQuiz(null)
    setAnswers({})
    setShowResults(false)

    try {
      const response = await generateQuiz(selectedFiles, numQuestions)
      setQuiz(response.quiz)
    } catch (err) {
      setError('Failed to generate quiz. Please try again.')
      console.error('Quiz error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const handleReset = () => {
    setQuiz(null)
    setAnswers({})
    setShowResults(false)
  }

  const toggleFileSelection = (file) => {
    setSelectedFiles((prev) => {
      if (prev.find((f) => f.file.name === file.file.name)) {
        return prev.filter((f) => f.file.name !== file.file.name)
      } else {
        return [...prev, file]
      }
    })
  }

  const getScore = () => {
    if (!quiz) return 0
    let correct = 0
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <HelpCircle className="quiz-icon" />
        <div>
          <h2>Practice Quiz Generator</h2>
          <p>Test your knowledge with AI-generated quizzes from your materials</p>
        </div>
      </div>

      {uploadedFiles.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-icon" />
          <p>Upload course materials first to generate practice quizzes</p>
        </div>
      ) : (
        <>
          <div className="quiz-config">
            <div className="config-section">
              <label>Select materials for quiz:</label>
              <div className="files-checkbox-list">
                {uploadedFiles.map((item, index) => (
                  <label key={index} className="file-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFiles.some(
                        (f) => f.file.name === item.file.name
                      )}
                      onChange={() => toggleFileSelection(item)}
                    />
                    <span>{item.file.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="config-section">
              <label htmlFor="num-questions">Number of questions:</label>
              <input
                id="num-questions"
                type="number"
                min="3"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className="num-input"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={selectedFiles.length === 0 || loading}
              className="generate-button"
            >
              {loading ? (
                <>
                  <Loader className="spinner-icon" />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <HelpCircle size={20} />
                  <span>Generate Quiz</span>
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
              <p>Generating quiz questions from your materials...</p>
            </div>
          )}

          {quiz && (
            <div className="quiz-section">
              <div className="quiz-header-actions">
                <h3>Quiz Questions</h3>
                {!showResults && (
                  <button onClick={handleReset} className="reset-button">
                    <RotateCcw size={18} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="questions-list">
                {quiz.questions.map((question, index) => {
                  const isCorrect = answers[question.id] === question.correctAnswer
                  const showAnswer = showResults

                  return (
                    <div
                      key={question.id}
                      className={`question-card ${showAnswer ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                    >
                      <div className="question-number">Question {index + 1}</div>
                      <div className="question-text">{question.question}</div>
                      <div className="options-list">
                        {question.options.map((option, optIndex) => {
                          const isSelected = answers[question.id] === option
                          const isCorrectOption = option === question.correctAnswer

                          return (
                            <label
                              key={optIndex}
                              className={`option-label ${isSelected ? 'selected' : ''} ${showAnswer && isCorrectOption ? 'correct-answer' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={isSelected}
                                onChange={() => handleAnswerChange(question.id, option)}
                                disabled={showResults}
                              />
                              <span className="option-text">{option}</span>
                              {showAnswer && isCorrectOption && (
                                <CheckCircle className="correct-icon" size={20} />
                              )}
                              {showAnswer && isSelected && !isCorrectOption && (
                                <XCircle className="incorrect-icon" size={20} />
                              )}
                            </label>
                          )
                        })}
                      </div>
                      {showAnswer && (
                        <div className="explanation">
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
                  className="submit-quiz-button"
                >
                  Submit Quiz
                </button>
              ) : (
                <div className="results-section">
                  <div className="score-card">
                    <h3>Your Score</h3>
                    <div className="score-value">
                      {getScore()} / {quiz.questions.length}
                    </div>
                    <div className="score-percentage">
                      {Math.round((getScore() / quiz.questions.length) * 100)}%
                    </div>
                  </div>
                  <button onClick={handleReset} className="new-quiz-button">
                    <RotateCcw size={18} />
                    <span>Generate New Quiz</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Quiz



