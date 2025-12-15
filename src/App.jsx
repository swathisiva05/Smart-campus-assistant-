import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import Chat from './components/Chat'
import './App.css'

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <BookOpen className="title-icon" />
            Smart Campus Assistant
          </h1>
          <p className="app-subtitle">Your AI-powered study companion - Ask me anything!</p>
        </div>
      </header>

      <main className="app-main">
        <Chat 
          uploadedFiles={uploadedFiles} 
          setUploadedFiles={setUploadedFiles} 
        />
      </main>
    </div>
  )
}

export default App

