LEARNO - AI-Powered Learning Management System

Learn. Practice. Progress.


1. About the Project

Learno is a full-stack Learning Management System (LMS) designed to provide students with an interactive, personalized, and measurable digital learning experience.

The platform enables students to discover courses, enroll in courses, access lessons, complete quizzes, track learning progress, analyze performance, receive personalized recommendations, interact with an AI learning assistant, and earn course completion certificates.

Learno also provides dedicated dashboards for students, instructors, and administrators.

2. Problem Statement

Traditional online learning platforms often focus mainly on course delivery and assessments. Students may still face difficulty identifying what to study next, getting immediate help with difficult concepts, understanding quiz performance, and monitoring their learning progress effectively.

Instructors also need efficient tools to manage courses, lessons, quizzes, and student performance.

Learno addresses these challenges by combining course management, assessment, progress tracking, analytics, personalized recommendations, and AI-assisted learning in one platform.

3. Our Solution

Learno provides an end-to-end learning workflow:

Course Discovery → Course Enrollment → Structured Lessons → Progress Tracking → Interactive Quizzes → Performance Analytics → Personalized Recommendations → AI Learning Assistance → Course Completion → Digital Certificate

4. Objectives

1. Provide a centralized platform for online learning.
2. Allow students to discover and enroll in courses.
3. Provide structured lessons and learning content.
4. Automatically track student learning progress.
5. Conduct online quizzes and automatically calculate scores.
6. Provide meaningful performance analytics.
7. Provide AI-based assistance for difficult concepts.
8. Recommend relevant learning content.
9. Allow instructors to manage courses and assessments.
10. Allow administrators to manage the platform.
11. Provide certificates after successful course completion.
12. Maintain secure and persistent user data.

5. Key Features

STUDENT
• Secure registration and login
• Course browsing, search and filtering
• Course enrollment
• Structured lessons and video support
• Lesson completion tracking
• Automatic course progress calculation
• Online quizzes and automatic scoring
• Quiz history and performance analytics
• Personalized course/lesson recommendations
• Learno AI learning assistant
• Course completion certificates
• Student profile and dashboard

INSTRUCTOR
• Instructor dashboard
• Create, edit and delete courses
• Add, edit and delete lessons
• Create and manage quizzes
• Add and manage quiz questions
• View enrolled students
• View course and assessment statistics

ADMIN
• Admin dashboard
• User management
• Course management
• Platform statistics
• Role-based administrative access

6. Unique Features

1. Learno AI Learning Assistant
Students can ask questions about learning topics and receive AI-powered explanations, examples, summaries, and practice questions through the Gemini API.

2. Personalized Learning Recommendations
Learno uses course enrollment, lesson progress, categories, and quiz performance to recommend relevant learning content.

3. Quiz Performance Analytics
Students can view scores, average performance, highest scores, recent attempts, and performance trends.

4. Automatic Progress Tracking
Course progress is calculated from actual completed lessons and persisted in the database.

5. Digital Course Certificates
Students who satisfy course completion requirements can receive a digital certificate containing the student name, course name, completion date, and certificate ID.

7. User Roles

Student — Learns courses, completes lessons, attempts quizzes, tracks progress, uses AI assistance, and earns certificates.

Instructor — Creates and manages courses, lessons, quizzes, questions, and views student performance.

Admin — Manages users, courses, and platform-level data.

8. System Workflow

STUDENT:
Register → Login → Dashboard → Browse Courses → Enroll → Study Lessons → Mark Complete → Progress Update → Take Quiz → View Score → View Analytics → Ask Learno AI → Complete Course → Certificate

INSTRUCTOR:
Login → Dashboard → Create Course → Add Lessons → Create Quiz → Add Questions → Publish/Manage Course → Monitor Students → View Analytics

ADMIN:
Login → Dashboard → View Users → Manage Users → View Courses → Manage Courses → Monitor Platform

9. System Architecture

Learno follows a full-stack architecture:

React + Vite Frontend
        ↓
REST API
        ↓
Node.js + Express Backend
        ↓
Prisma ORM
        ↓
PostgreSQL / Supabase

The backend also securely communicates with the Gemini API for the Learno AI assistant.

10. Technology Stack

Frontend:
• React
• Vite
• TypeScript
• Tailwind CSS
• React Router
• Axios

Backend:
• Node.js
• Express.js
• TypeScript
• JWT
• bcrypt

Database:
• PostgreSQL
• Supabase
• Prisma ORM

Artificial Intelligence:
• Gemini API

Development and Deployment:
• Git
• GitHub
• Vercel
• Render

11. Database Design

Main entities:

User
Course
Lesson
Enrollment
LessonProgress
Quiz
Question
QuizAttempt
Certificate

Relationships:
• Users can create courses and enroll in courses.
• Courses contain lessons and quizzes.
• Quizzes contain questions.
• Enrollments connect students with courses.
• LessonProgress tracks completed lessons.
• QuizAttempt stores student assessment results.
• Certificates are issued for completed courses.

12. Project Structure

learno/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md

13. Application Pages

Public:
• Home
• Courses
• Course Details
• Login
• Register

Student:
• Student Dashboard
• My Courses
• Course Learning Page
• Lesson Page
• Quiz Page
• Certificates
• Profile

Instructor:
• Instructor Dashboard
• Course Management
• Course Creation
• Lesson Management
• Quiz Management

Admin:
• Admin Dashboard
• User Management
• Course Management

14. Real-Time Data Synchronization

Learno uses persistent backend data rather than static frontend data for core operations.

Example:
Student Action → React Frontend → REST API → Express Backend → Prisma → PostgreSQL → API Response → Frontend State Update

When a student marks a lesson complete, the progress is saved to PostgreSQL, recalculated, returned by the API, and immediately reflected in the interface.

15. Security

• JWT-based authentication
• bcrypt password hashing
• Protected routes
• Role-based authorization
• Input validation
• CORS configuration
• Environment variables for secrets

Sensitive values such as DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY must never be committed to GitHub. The repository should contain an .env.example file with placeholders.

16. Installation

Prerequisites:
• Node.js
• npm
• Git
• GitHub account
• Supabase account

Clone:
git clone https://github.com/YOUR_USERNAME/learno-lms.git
cd learno-lms

Install frontend:
cd frontend
npm install

Install backend:
cd ../backend
npm install

17. Environment Variables

Backend .env:

PORT=5000
DATABASE_URL=your_supabase_database_url
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173

Frontend .env:

VITE_API_URL=http://localhost:5000/api

Never commit actual .env files or secret keys.

18. Database Setup

From the backend directory:

npx prisma generate
npx prisma migrate dev

If seed data is configured:

npx prisma db seed

19. Running the Application

Start backend:

cd backend
npm run dev

Backend:
http://localhost:5000

Start frontend in another terminal:

cd frontend
npm run dev

Frontend:
http://localhost:5173

20. API Overview

Authentication:
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Courses:
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id

Enrollment:
POST /api/enrollments
GET  /api/enrollments

Progress:
POST /api/progress
GET  /api/progress/:courseId

Quizzes:
GET  /api/quizzes/:id
POST /api/quizzes/:id/submit

AI:
POST /api/ai/chat

The exact endpoints may vary according to the final implementation.

21. Testing Checklist

Student:
☐ Register
☐ Login
☐ Browse courses
☐ Search/filter courses
☐ Enroll
☐ Open lessons
☐ Mark lesson complete
☐ Verify progress
☐ Attempt quiz
☐ Submit quiz
☐ Verify score
☐ View analytics
☐ Use Learno AI
☐ Complete course
☐ Generate certificate

Instructor:
☐ Login
☐ Create course
☐ Manage lessons
☐ Create quiz
☐ Manage questions
☐ View students
☐ View statistics

Admin:
☐ Login
☐ View users
☐ Manage users
☐ View courses
☐ Manage courses

22. Deployment

Frontend: Vercel
Backend: Render
Database: Supabase PostgreSQL

Production environment variables must be configured on the respective deployment platforms. CORS and production API URLs must be configured before deployment.

23. Live Links

Live Application: YOUR_VERCEL_URL
Backend API: YOUR_RENDER_URL
GitHub Repository: YOUR_GITHUB_REPOSITORY_URL

Replace these placeholders with the actual links before submission.

24. Future Enhancements

• Live classes
• Discussion forums
• Peer-to-peer learning
• Advanced AI tutoring
• Voice-based AI assistant
• AI-generated quizzes
• Advanced recommendation engine
• Gamification
• Badges and achievements
• Leaderboards
• Mobile application
• Assignment submission
• Instructor-student messaging
• Learning streaks
• Advanced learning analytics

25. Project Information

Project Name: Learno
Project Type: College Capstone / Hackathon Project
Domain: EdTech
Category: Learning Management System / Artificial Intelligence / Full-Stack Development
Target Users: Students, Instructors, Administrators
Development Approach: AI-Assisted / Vibe Coding

26. License

This project is developed for educational and hackathon purposes.
