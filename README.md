# 🎓 Smart Campus Assistant

Smart Campus Assistant is a React-based AI learning assistant that helps college students study efficiently by organizing course materials and providing intelligent features like Q&A, summaries, and quizzes.

---

## 📌 Project Description

Students often struggle to manage scattered PDFs, notes, and learning resources. This project provides a centralized and interactive platform where students can upload materials and interact with them using AI-powered tools.

---

## ✨ Features

- 📂 File Upload  
  Upload study materials such as PDFs, documents, and PPTs.

- 💬 Question & Answer (QnA)  
  Ask questions in natural language and get relevant answers from the content.

- 📝 Document Summarization  
  Automatically generate summaries from long lecture notes.

- 🧠 Quiz Generator  
  Generate quizzes from study materials to test knowledge retention.

- 💻 Modular UI  
  Built with reusable React components and clean CSS styling.

---

## 🛠️ Tech Stack

| Category | Technology |
|--------|------------|
| Frontend | React (Vite) |
| Language | JavaScript |
| Styling | CSS |
| Build Tool | Vite |
| Version Control | Git |

---

## ⚙️ Working of the Smart Campus Assistant

1. The user opens the Smart Campus Assistant web application.

2. The application loads the main React component (`App.jsx`) which renders
   different feature components such as FileUpload, QnA, Summary, and Quiz.

3. **File Upload**
   - The user uploads study materials (PDF / documents).
   - `FileUpload.jsx` handles file selection and upload logic.
   - Uploaded files are prepared for processing (backend/API integration ready).

4. **Question & Answer (QnA)**
   - The user enters a question in natural language.
   - `QnA.jsx` captures the question input.
   - The question is sent to the service layer (`services/`) for processing.
   - The response is displayed to the user.

5. **Summarization**
   - The user selects a document or content to summarize.
   - `Summary.jsx` processes the request.
   - A concise summary is generated and shown on the UI.

6. **Quiz Generation**
   - The user selects the quiz option.
   - `Quiz.jsx` generates questions based on the content.
   - The quiz is displayed interactively for the user.

7. **Styling & UI**
   - Each component has its own CSS file for styling.
   - The UI is clean, modular, and easy to navigate.

8. The application runs locally using Vite development server
   and can be extended with backend AI services in the future.
