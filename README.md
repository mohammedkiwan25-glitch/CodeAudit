# CodeAudit

A full-stack technical interview and collaborative coding platform that allows users to create, join, and manage live coding interview sessions.

CodeAudit provides an interactive coding environment with real-time communication, video calling, chat, problem management, code execution, interview reports, analytics, and supervisor tools.

## 🚀 Features

### 👨‍💻 Live Coding Interviews

* Create and join technical interview sessions.
* Share interview sessions using secure invite links.
* Collaborative coding workspace.
* Support for multiple programming languages.
* Real-time code synchronization between participants.
* Code execution and output display.

### 🎥 Video & Communication

* Real-time video calls using Stream.
* Integrated chat functionality.
* Participant management during interview sessions.

### 📝 Coding Problems

* Browse a collection of coding problems.
* Filter problems by difficulty.
* Create custom problems.
* Edit and delete personal problems.
* Add descriptions, examples, constraints, and starter code.
* Support for JavaScript, Python, and Java.

### 📊 Interview Reports & Analytics

* Evaluate completed interview sessions.
* Score candidates using a structured rubric:

  * Problem Solving
  * Correctness
  * Code Quality
  * Communication
  * Complexity
* Add strengths, areas for improvement, and interview notes.
* Choose an interview outcome:

  * Strong Hire
  * Hire
  * No Hire
* View interview history and session reviews.
* Track analytics and interview statistics.

### 👨‍💼 Supervisor Dashboard

* View an overview of users and interview sessions.
* Monitor completed sessions and outcomes.
* Access interview analytics.
* Manage coding problems.

### 🔐 Authentication

* User authentication and management using Clerk.
* Protected routes.
* Role-based access for supervisors.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* DaisyUI
* TanStack React Query
* Axios
* Monaco Editor
* Clerk
* Stream Video SDK
* Stream Chat

### Backend

* Node.js
* Express
* MongoDB
* Mongoose
* Clerk
* Stream
* Inngest

### External Services

* **Clerk** – Authentication and user management.
* **MongoDB** – Database.
* **Stream** – Video calls and chat.
* **Inngest** – Background event handling and user synchronization.
* **Online Compiler API** – Code execution.

---

## 📁 Project Structure

```text
CodeAudit/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── pages/
│   └── package.json
│
└── package.json
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/mohammedkiwan25-glitch/CodeAudit.git
cd CodeAudit
```

### 2. Install dependencies

Install the backend dependencies:

```bash
npm install --prefix backend
```

Install the frontend dependencies:

```bash
npm install --prefix frontend
```

---

## 🔑 Environment Variables

### Backend

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### Frontend

Create a `.env` file inside the `frontend` folder:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STREAM_API_KEY=your_stream_api_key
VITE_COMPILER_API_KEY=your_compiler_api_key
```

> Never commit your `.env` files or API secrets to GitHub.

---

## ▶️ Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

The backend will run using Nodemon.

### Start the frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The application will then be available through the local Vite development server.

---

## 🏗️ Production Build

From the root directory:

```bash
npm run build
```

To start the backend:

```bash
npm start
```

---

## 📱 Main Pages

* **Landing Page** – Introduction to the CodeAudit platform.
* **Dashboard** – Overview of active and recent interview sessions.
* **Interview Setup** – Create a new coding interview.
* **Session Workspace** – Collaborative coding environment with video and chat.
* **Problems** – Browse available coding challenges.
* **My Problems** – Manage custom coding problems.
* **Problem Editor** – Create and edit interview questions.
* **Interview History** – View previous interview sessions.
* **Session Review** – Review completed interviews.
* **Session Report** – Evaluate candidates and submit interview feedback.
* **Analytics** – View interview and performance statistics.
* **Supervisor Dashboard** – Administrative overview and management tools.

---

## 🔄 How It Works

1. A user signs in using Clerk.
2. The user creates a new interview session.
3. A coding problem is selected from the problem bank or created manually.
4. The system generates a session and invite link.
5. Another participant joins the interview.
6. Both users collaborate in the coding workspace.
7. Video calling and chat are available during the session.
8. Code can be executed directly from the platform.
9. After the interview, the interviewer can complete an evaluation report.
10. Completed sessions are stored and included in analytics and interview history.

---

## 📦 Available Scripts

### Root

```bash
npm run build
```

Installs backend and frontend dependencies and builds the frontend.

```bash
npm start
```

Starts the backend server.

### Frontend

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run lint
```

Runs ESLint.

### Backend

```bash
npm run dev
```

Starts the backend with Nodemon.

```bash
npm start
```

Starts the backend using Node.js.

---

## 🔮 Future Improvements

* Real-time collaborative cursor support.
* Automated interview scheduling.
* AI-assisted code review and interview feedback.
* Additional programming languages.
* Enhanced analytics and candidate performance tracking.
* Email notifications for interview invitations.
* Interview recording and playback.
* Improved test case management.

---

## 👤 Author

**Mohammed Kiwan**

GitHub: [mohammedkiwan25-glitch](https://github.com/mohammedkiwan25-glitch?utm_source=chatgpt.com)

## 📄 License

This project is licensed under the ISC License.
