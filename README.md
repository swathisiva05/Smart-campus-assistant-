# Smart Campus Assistant

An AI-powered study companion that helps college students efficiently learn from their course materials.

## Features

- **💬 Unified Chat Interface**: Single chat interface for all interactions - no separate buttons needed!
- **📁 File Upload**: Drag-and-drop files directly into the chat or use the upload button
- **💬 Q&A**: Ask natural language questions and get answers from your uploaded materials
- **📝 Summarization**: Simply ask "summarize [filename]" or "give me a summary" to get concise summaries
- **❓ Practice Quizzes**: Ask "create a quiz with 5 questions" or "generate practice quiz" to test your knowledge
- **🤖 Smart Intent Detection**: The AI automatically understands what you want - summarize, quiz, or Q&A

## Tech Stack

- **Frontend**: React 18 with Vite
- **UI**: Custom CSS with modern design
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Usage

The application features a unified chat interface. Simply:

1. **Upload files**: Drag and drop files into the chat area or click the upload button
2. **Ask questions**: Type any question about your materials
3. **Request summaries**: Type "summarize [filename]" or "give me a summary"
4. **Generate quizzes**: Type "create a quiz with 5 questions" or "generate practice quiz"

Examples:
- "What are the main concepts in chapter 3?"
- "Summarize lecture1.pdf"
- "Create a quiz with 10 questions"
- "Give me important questions from the uploaded materials"

## Project Structure

```
smart-campus-assistant/
├── src/
│   ├── components/
│   │   ├── Chat.jsx            # Unified chat interface (main component)
│   │   ├── FileUpload.jsx      # Legacy file upload (kept for reference)
│   │   ├── QnA.jsx             # Legacy Q&A (kept for reference)
│   │   ├── Summary.jsx         # Legacy summary (kept for reference)
│   │   └── Quiz.jsx            # Legacy quiz (kept for reference)
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Application styles
│   ├── index.css               # Global styles
│   └── main.jsx                # Application entry point
├── index.html
├── package.json
└── vite.config.js
```

## Backend Integration

The application is designed to work with a backend API. Currently, it includes mock responses when the API is unavailable. To connect to a real backend:

1. Set the `VITE_API_BASE_URL` environment variable to your backend URL
2. Implement the following API endpoints:

### Endpoints

- `POST /api/upload` - Upload course materials
- `POST /api/qa` - Ask questions about materials
- `POST /api/summarize` - Generate document summaries
- `POST /api/quiz` - Generate practice quizzes

### Example Backend Implementation

You can use Python with FastAPI/Flask, Node.js with Express, or any other backend framework. The backend should:

1. **File Processing**: Extract text from PDFs, DOCX, and PPTX files
2. **Vector Storage**: Store document embeddings (using Pinecone, Weaviate, or similar)
3. **AI Integration**: 
   - Use OpenAI GPT, Anthropic Claude, or open-source LLMs for Q&A and summarization
   - Implement RAG (Retrieval Augmented Generation) for accurate answers
4. **Quiz Generation**: Use AI to generate questions and answers from document content

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Future Enhancements

- [ ] Real-time collaboration features
- [ ] Support for more file formats
- [ ] Integration with Wikipedia API
- [ ] NCERT textbook integration
- [ ] User authentication and cloud storage
- [ ] Mobile app version
- [ ] Advanced analytics and progress tracking

## License

MIT

