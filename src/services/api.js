import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// File Upload
export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    // For demo purposes, return mock data if API is not available
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      console.warn('API not available, using mock response')
      return {
        id: Date.now().toString(),
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }
    }
    throw error
  }
}

// Q&A
export const askQuestion = async (question, uploadedFiles) => {
  try {
    const response = await api.post('/qa', {
      question,
      fileIds: uploadedFiles.map((f) => f.id || f.file.name),
    })
    return response.data
  } catch (error) {
    // Mock response for demo
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      console.warn('API not available, using mock response')
      return {
        answer: `Based on your uploaded materials, here's a sample answer to your question: "${question}". 

In a real implementation, this would be generated using AI/ML models that analyze your uploaded documents. The system would:
1. Extract relevant information from your course materials
2. Use natural language processing to understand your question
3. Generate a comprehensive answer based on the content

To implement this, you would need to set up a backend service with:
- Document processing (PDF parsing, text extraction)
- Vector embeddings and similarity search (e.g., using OpenAI embeddings, Pinecone, or similar)
- LLM integration (OpenAI GPT, Anthropic Claude, or open-source models)
- Wikipedia API integration for general knowledge`,
      }
    }
    throw error
  }
}

// Document Summarization
export const summarizeDocument = async (fileItem) => {
  try {
    const response = await api.post('/summarize', {
      fileId: fileItem.id || fileItem.file.name,
    })
    return response.data
  } catch (error) {
    // Mock response for demo
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      console.warn('API not available, using mock response')
      return {
        summary: `Summary of ${fileItem.file.name}:

This is a sample summary. In a real implementation, the system would:

1. Extract text content from the document (PDF, DOCX, or PPTX)
2. Use AI summarization models (like GPT-3.5/4, Claude, or BART) to generate concise summaries
3. Identify key concepts, main points, and important details
4. Present the summary in a structured format

Key features that would be implemented:
- Automatic text extraction from various file formats
- Intelligent summarization preserving important information
- Configurable summary length (short, medium, detailed)
- Support for multiple languages
- Citation of source sections

To implement this, integrate with:
- Document parsing libraries (pdf-parse, mammoth, etc.)
- Summarization APIs or models
- Optional: Wikipedia API for context enhancement`,
      }
    }
    throw error
  }
}

// Quiz Generation
export const generateQuiz = async (selectedFiles, numQuestions) => {
  try {
    const response = await api.post('/quiz', {
      fileIds: selectedFiles.map((f) => f.id || f.file.name),
      numQuestions,
    })
    return response.data
  } catch (error) {
    // Mock response for demo
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      console.warn('API not available, using mock response')
      const mockQuestions = Array.from({ length: numQuestions }, (_, i) => ({
        id: `q${i + 1}`,
        question: `Sample question ${i + 1} based on your uploaded materials?`,
        options: [
          'Option A - This would be generated from your documents',
          'Option B - AI would analyze content to create distractors',
          'Option C - Correct answer would be identified from materials',
          'Option D - All options would be contextually relevant',
        ],
        correctAnswer: 'Option C - Correct answer would be identified from materials',
        explanation: `This is a sample explanation. In a real implementation, the AI would generate questions by:
1. Analyzing key concepts from your uploaded materials
2. Creating multiple-choice questions with plausible distractors
3. Identifying the correct answer based on document content
4. Providing explanations that reference specific sections of your materials`,
      }))

      return {
        quiz: {
          id: Date.now().toString(),
          questions: mockQuestions,
          generatedAt: new Date().toISOString(),
        },
      }
    }
    throw error
  }
}

export default api



