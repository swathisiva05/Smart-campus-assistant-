# 🎓 Smart Campus Assistant

Smart Campus Assistant is a React-based AI learning assistant designed to help college students study efficiently by organizing course materials and providing intelligent features such as Question & Answer, Summarization, and Quiz generation.

---

## 📌 Project Overview

College students often struggle to manage scattered lecture PDFs, notes, and study resources. The Smart Campus Assistant provides a centralized platform where students can upload their materials and interact with them through an intuitive and modular user interface.

---

## 🎯 Objectives

- Centralize student study materials
- Enable natural language question answering
- Automatically summarize long lecture notes
- Generate quizzes for practice and revision
- Improve learning efficiency and retention

---

## ✨ Features

- 📂 **File Upload**
  - Upload PDFs and documents using a simple interface

- 💬 **Question & Answer (QnA)**
  - Ask questions in natural language
  - Receive relevant answers from the content

- 📝 **Summarization**
  - Generate short summaries from long documents

- 🧠 **Quiz Generator**
  - Create quizzes from study material
  - Helps in exam preparation

- 💻 **Modular React UI**
  - Clean and reusable components
  - Easy navigation and maintenance

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React (Vite) |
| Language | JavaScript |
| Styling | CSS |
| Build Tool | Vite |
| Version Control | Git |

---

## ⚙️ Working of the Project

1. The user opens the Smart Campus Assistant web application in the browser.

2. The application loads the main React component (`App.jsx`), which controls navigation between different features.

3. **File Upload**
   - The user uploads study materials using `FileUpload.jsx`.
   - Files are prepared for processing and future backend integration.

4. **Question & Answer (QnA)**
   - The user enters a question in natural language.
   - `QnA.jsx` captures the input and processes the request.
   - The response is displayed on the screen.

5. **Summarization**
   - The user selects content to summarize.
   - `Summary.jsx` generates a concise summary for quick revision.

6. **Quiz Generation**
   - The user chooses the quiz option.
   - `Quiz.jsx` generates questions based on the uploaded material.
   - The quiz is displayed interactively.

7. Each feature is implemented as a separate React component,
   making the application modular and easy to maintain.

8. The project runs using the Vite development server and can be
   extended with backend AI services in the future.

---



## 📁 Project Structure

