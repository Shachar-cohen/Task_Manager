# Task Manager – Fullstack Application with AI

A fullstack task management system that allows users to manage personal tasks securely, with AI-powered task description improvement using Google Gemini.

This project was built as an academic assignment and is also suitable for demonstration in job interviews.

---

## ✨ Features

- User registration and login (JWT authentication)
- Secure access – each user sees only their own tasks
- Create, edit, delete tasks (CRUD)
- Task completion tracking (Done / Not Done)
- Task priority management (Low / Medium / High)
- Search tasks by title
- Pagination for large task lists
- AI-powered task description improvement using Google Gemini API
- Accept / Undo AI suggestions
- Clean and responsive UI

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- JWT Authentication

### Database
- MongoDB Atlas
- Mongoose

### AI Integration
- Google Gemini API (`gemini-2.5-flash`)

---

## 📁 Project Structure

Task_Manager/
│
├── client/ # React frontend
│
├── server/ # Node.js + Express backend
│
├── .gitignore
└── README.md

---

## 🔐 Authentication Flow

- User logs in / registers
- Server generates a JWT token
- Token is stored in `localStorage`
- Axios interceptor attaches token to every request
- Backend middleware validates token and extracts user ID

---

## 🤖 AI Integration

The system integrates with Google Gemini to:
- Improve task descriptions
- Suggest whether the task priority should be changed

The AI response is:
- Deterministic (temperature = 0)
- Plain text only
- Displayed in the UI with Accept / Undo options

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/Shachar-cohen/Task_Manager.git
cd Task_Manager


2. Backend setup:
cd server
npm install


Create a .env file:

MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key


Run the server:
node server.js

3. Frontend setup:
cd ../client
npm install
npm run dev

