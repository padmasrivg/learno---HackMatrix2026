# Learno: Your AI Learning Partner

Build a complete, production-style Learning Management System called "Learno".

Learno is a modern AI-powered Learning Management System inspired by platforms such as NPTEL, but it must be an original design and implementation.

IMPORTANT:

This is a hackathon project and I have complete it by today .

Therefore:

- Prioritize functionality and reliability.

- Do not create a static prototype.

- Do not use fake/mock data for core features.

- All important data must be stored in a real PostgreSQL database.

- All user actions must persist to the database.

- Authentication must be real.

- Course enrollment must be real.

- Quiz scoring must be real.

- Progress tracking must be real.

- Instructor course management must be real.

- Admin management must be real.

- AI features must work through a secure backend/API.

- The application must be deployable.

====================================================

1. PROJECT NAME

====================================================

LEARNO

Tagline:

"Learn. Practice. Progress."

Purpose:

Learno is an AI-powered LMS where students can discover courses, enroll, learn through structured lessons, take quizzes, track their progress, receive personalized recommendations, ask an AI learning assistant questions, and earn certificates after completing courses.

====================================================

2. TECHNOLOGY REQUIREMENTS

====================================================

Use the following technology stack wherever supported:

Frontend:

- React

- Vite

- TypeScript

- Tailwind CSS

- React Router

- Modern responsive UI

Backend:

- Node.js

- Express.js

- REST APIs

- TypeScript

Database:

- PostgreSQL

- Supabase PostgreSQL

ORM:

- Prisma

Authentication:

- JWT

- bcrypt password hashing

- Role-based authorization

AI:

- Gemini API

- API key must NEVER be exposed in the frontend

Deployment target:

- Frontend: Vercel

- Backend: Render

- Database: Supabase

Version control:

- GitHub

Do not introduce unnecessary technologies.

====================================================

3. USER ROLES

====================================================

Implement three roles:

1. STUDENT

2. INSTRUCTOR

3. ADMIN

Each role must have different permissions.

====================================================

4. STUDENT FEATURES

====================================================

Create a complete student experience.

Student can:

- Register

- Login

- Logout

- View profile

- Browse courses

- Search courses

- Filter courses

- View course details

- Enroll in courses

- View enrolled courses

- Open lessons

- Watch lesson videos

- Read lesson content

- Mark lessons as completed

- Automatically track course progress

- Continue from the last accessed lesson

- Take quizzes

- Submit quizzes

- Receive instant results

- View quiz history

- View quiz performance analytics

- Receive learning recommendations

- Ask Learno AI questions

- Complete courses

- Generate certificates

- Download certificates

====================================================

5. STUDENT DASHBOARD

====================================================

Create a modern dashboard.

Dashboard must show:

- Welcome message

- Total enrolled courses

- Courses in progress

- Completed courses

- Overall learning progress

- Continue Learning section

- Recent quiz results

- Recommended courses

- Certificates

- Recent activity

Example:

--------------------------------

Welcome back, Student !

Continue Learning

[Course Card]

My Learning

[Course Card] [Course Card]

Quiz Performance

[Chart]

Recommended For You

[Course Card] [Course Card]

Certificates

[Certificate Card]

--------------------------------

All information must come from the database.

====================================================

6. COURSE SYSTEM

====================================================

Courses must contain:

- Course title

- Description

- Category

- Difficulty

- Duration

- Thumbnail

- Instructor

- Modules/lessons

- Quizzes

- Created date

- Updated date

- Enrollment count

Create course cards showing:

- Thumbnail

- Title

- Instructor

- Category

- Difficulty

- Duration

- Enrollment count

- Progress if enrolled

- Enroll/View button

====================================================

7. COURSE DETAILS PAGE

====================================================

Course detail page should display:

- Course thumbnail

- Course title

- Instructor

- Description

- Category

- Difficulty

- Duration

- Number of lessons

- Number of quizzes

- Enrollment count

- Course curriculum

If the student is not enrolled:

Show:

"Enroll Now"

If enrolled:

Show:

"Continue Learning"

====================================================

8. ENROLLMENT SYSTEM

====================================================

Implement real enrollment.

When a student clicks Enroll:

Frontend

→ Backend API

→ PostgreSQL

→ Successful response

→ UI updates immediately

Prevent duplicate enrollment.

Store:

- student ID

- course ID

- enrollment date

- completion status

====================================================

9. LESSON SYSTEM

====================================================

Each course should have multiple lessons.

Lesson fields:

- Title

- Description

- Content

- Video URL

- Duration

- Order

Student lesson page must contain:

- Course name

- Lesson title

- Lesson content

- Video player/embed if video URL exists

- Previous lesson

- Next lesson

- Mark as Complete button

- Course progress

- AI Assistant

When the student marks a lesson complete:

Persist completion in PostgreSQL.

Do not rely on localStorage for actual progress.

====================================================

10. REAL PROGRESS TRACKING

====================================================

Progress must be calculated from actual completed lessons.

Example:

Course has 10 lessons.

Student completes 7.

Display:

70% completed

7 / 10 lessons completed

The progress bar must automatically update after lesson completion.

Store progress in PostgreSQL.

Display:

- Completed lessons

- Total lessons

- Percentage

- Last accessed lesson

- Completion status

====================================================

11. QUIZ SYSTEM

====================================================

Implement real quizzes.

Instructor can create:

- Quiz

- Questions

- Four options

- Correct answer

Student can:

- Open quiz

- Select answers

- Submit quiz

- Receive score

Backend calculates the score.

Store:

- Student

- Quiz

- Score

- Total questions

- Percentage

- Attempt date

IMPORTANT:

Never expose correct answers to students before quiz submission.

After submission show:

Score:

8 / 10

Percentage:

80%

Correct:

8

Incorrect:

2

Result:

Passed

====================================================

12. QUIZ ANALYTICS

====================================================

Create quiz performance analytics.

Student dashboard should show:

- Recent quiz scores

- Average score

- Highest score

- Quiz history

- Performance chart

Use charts where appropriate.

Also identify weak performance.

Example:

DBMS:

65%

Java:

85%

Networking:

90%

Then recommend reviewing relevant lessons when performance is low.

====================================================

13. UNIQUE FEATURE — LEARNO AI

====================================================

Create an AI Learning Assistant called:

"Ask Learno AI"

This is one of the main unique features.

The AI assistant should appear inside course/lesson pages.

Example UI:

--------------------------------

🤖 Ask Learno AI

Ask anything about this lesson...

[ Type your question... ] [Ask]

AI response:

"Normalization is a database design technique..."

--------------------------------

Students can ask questions such as:

"What is normalization?"

"Explain this topic simply."

"Give me an example."

"Create 3 practice questions."

The AI should provide educational responses.

Use Gemini API.

IMPORTANT SECURITY REQUIREMENT:

Never put the Gemini API key in frontend code.

The request must go through the secure backend:

React

↓

Express backend

↓

Gemini API

↓

Express backend

↓

React

Use environment variables.

If the AI API is unavailable, display a friendly error and keep the rest of Learno functional.

====================================================

14. UNIQUE FEATURE — PERSONALIZED RECOMMENDATIONS

====================================================

Create a:

"Recommended For You"

section.

Recommendations should use simple rules based on:

- Courses enrolled

- Course categories

- Quiz performance

- Incomplete courses

- Learning history

Example:

If student performs poorly in DBMS:

"Recommended:

Database Normalization — Review this lesson"

If student completed Java basics:

"Recommended:

Advanced Java Programming"

Do not build complicated machine learning.

A simple explainable recommendation system is sufficient.

====================================================

15. UNIQUE FEATURE — CERTIFICATES

====================================================

When a student successfully completes a course:

Generate a certificate.

Certificate must contain:

LEARNO

Certificate of Completion

"This certificate is awarded to"

Student Name

"For successfully completing"

Course Name

Completion Date

Certificate ID

Allow the student to download the certificate as PDF.

Only allow certificates after course completion.

====================================================

16. INSTRUCTOR DASHBOARD

====================================================

Create a professional instructor dashboard.

Show:

- Total courses

- Total enrolled students

- Total lessons

- Average quiz score

- Course completion statistics

Instructor can:

- Create course

- Edit course

- Delete course

- Add lesson

- Edit lesson

- Delete lesson

- Create quiz

- Edit quiz

- Delete quiz

- Add questions

- Edit questions

- Delete questions

- View enrolled students

- View course analytics

Instructor must only be able to modify their own courses.

====================================================

17. ADMIN DASHBOARD

====================================================

Create admin dashboard.

Display:

- Total users

- Total students

- Total instructors

- Total courses

- Total enrollments

Admin can:

- View users

- Search users

- Manage users

- Manage courses

- Delete inappropriate courses

- Change user roles if appropriate

Admin APIs must be protected.

====================================================

18. AUTHENTICATION

====================================================

Implement real authentication.

Registration:

- Name

- Email

- Password

- Role where appropriate

Login:

- Email

- Password

Password must be hashed with bcrypt.

Use JWT authentication.

Implement:

- Register

- Login

- Logout

- Current user

- Protected routes

- Role-based authorization

Do not store plain-text passwords.

Do not expose JWT secrets.

====================================================

19. DATABASE

====================================================

Use PostgreSQL.

Use Prisma ORM.

Create relational database tables/models:

User

Course

Lesson

Enrollment

LessonProgress

Quiz

Question

QuizAttempt

Certificate

Use proper relationships and foreign keys.

Suggested relationships:

User

→ Courses created

User

→ Enrollments

User

→ LessonProgress

User

→ QuizAttempts

User

→ Certificates

Course

→ Lessons

Course

→ Quizzes

Course

→ Enrollments

Quiz

→ Questions

Enrollment

→ LessonProgress

Include:

createdAt

updatedAt

where appropriate.

Prevent duplicate enrollments.

====================================================

20. REAL-TIME DATA REQUIREMENT

====================================================

The application must use real persistent data.

Do not use static arrays as the primary data source.

Do not create fake API responses.

When the user performs an action:

Enrollment

Lesson completion

Quiz submission

Course creation

Lesson creation

Course update

the change must be saved to PostgreSQL and reflected in the UI immediately after the API succeeds.

Use API refetch/state updates where appropriate.

For dashboards, fetch current database values.

WebSockets are NOT required.

"Real-time" means the application must immediately synchronize the UI with actual backend/database changes.

====================================================

21. RESPONSIVE UI

====================================================

Create a modern professional UI.

Design inspiration:

- NPTEL

- Coursera

- Udemy

- Modern SaaS dashboards

BUT:

Do not copy their branding or exact UI.

Learno must have its own identity.

Design characteristics:

- Clean

- Modern

- Minimal

- Professional

- Student friendly

- Responsive

- Accessible

Support:

Desktop

Tablet

Mobile

====================================================

22. BRANDING

====================================================

Brand:

LEARNO

Tagline:

"Learn. Practice. Progress."

Use a professional education/technology visual identity.

Create:

- Learno logo/text

- Navbar

- Footer

- Consistent buttons

- Cards

- Dashboard components

- Progress indicators

Use a clean modern color system.

Prefer a professional blue/indigo educational theme with appropriate neutral backgrounds.

====================================================

23. REQUIRED PAGES

====================================================

PUBLIC:

/

 /courses

 /courses/:id

 /login

 /register

STUDENT:

/student/dashboard

/student/courses

/student/courses/:id

/student/courses/:courseId/lesson/:lessonId

/student/courses/:courseId/quiz/:quizId

/student/certificates

/student/profile

INSTRUCTOR:

/instructor/dashboard

/instructor/courses

/instructor/courses/create

/instructor/courses/:id/edit

/instructor/courses/:id/lessons

/instructor/courses/:id/quizzes

ADMIN:

/admin/dashboard

/admin/users

/admin/courses

====================================================

24. UI STATES

====================================================

Every important page must have:

Loading state

Empty state

Error state

Success state

Example:

Loading courses...

No courses found.

Unable to load courses.

Course enrolled successfully.

Use toast notifications where appropriate.

====================================================

25. SECURITY

====================================================

Implement:

- Password hashing

- JWT authentication

- Protected routes

- Role-based authorization

- Input validation

- Secure API calls

- CORS

- Environment variables

Never expose:

DATABASE_PASSWORD

JWT_SECRET

GEMINI_API_KEY

Do not commit .env files.

Create .env.example.

====================================================

26. DEMO DATA

====================================================

Create realistic seed/demo data.

Include:

1 Admin

1 Instructor

2 Students

At least 5 courses.

Each course should have:

3–5 lessons

At least 1 quiz

Each quiz:

5–10 questions

Use realistic educational course names such as:

- Python Programming Fundamentals

- Web Development

- Database Management Systems

- Machine Learning Basics

- Computer Networks

Do not use lorem ipsum.

====================================================

27. ERROR HANDLING

====================================================

Handle:

Invalid login

Duplicate registration

Invalid token

Unauthorized access

Course not found

Lesson not found

Quiz not found

Duplicate enrollment

Database errors

AI API errors

Network errors

Display friendly messages.

Never expose backend stack traces to users.

====================================================

28. PERFORMANCE

====================================================

Keep the application lightweight.

Avoid unnecessary dependencies.

Use reusable components.

Optimize images.

Avoid unnecessary API calls.

Do not over-engineer.

====================================================

29. FINAL PROJECT STRUCTURE

====================================================

Create a clean structure similar to:

learno/

frontend/

backend/

prisma/

README.md

.env.example

Do not create an unnecessarily complicated architecture.

====================================================

30. README

====================================================

Create a professional README containing:

Project name

Project description

Features

Unique features

Technology stack

Architecture

Database schema overview

Installation

Environment variables

How to run frontend

How to run backend

Demo accounts

API overview

Deployment instructions

Future enhancements

====================================================

31. DEPLOYMENT

====================================================

Prepare the project for:

Frontend:

Vercel

Backend:

Render

Database:

Supabase PostgreSQL

Make sure:

Frontend API URL can be configured through environment variables.

Backend database URL can be configured through environment variables.

CORS supports the production frontend URL.

AI API key remains on backend.

====================================================

32. PRIORITY

====================================================

Because I have only 4 days, implement features in this priority:

MUST WORK:

1. Authentication

2. Role-based access

3. Student dashboard

4. Course browsing

5. Course details

6. Enrollment

7. Lessons

8. Progress tracking

9. Quiz

10. Quiz scoring

11. Instructor course management

12. Admin management

13. PostgreSQL persistence

UNIQUE FEATURES:

14. Learno AI Assistant

15. Quiz analytics

16. Personalized recommendations

17. Certificate generation

If an advanced feature causes problems, NEVER break the core LMS.

====================================================

33. IMPORTANT IMPLEMENTATION RULE

====================================================

Do not build only a frontend prototype.

Every important button must perform a real operation.

For example:

"Enroll Now"

→ real API

→ database insert

→ UI update

"Mark Complete"

→ real API

→ database update

→ progress recalculation

→ UI update

"Submit Quiz"

→ backend scoring

→ database record

→ result shown

"Create Course"

→ backend API

→ database insert

→ instructor dashboard update

"Ask AI"

→ backend

→ Gemini

→ response

====================================================

34. DEVELOPMENT APPROACH

====================================================

Build the project incrementally.

First create the core application architecture.

Then implement:

PHASE 1:

Project setup and UI foundation

PHASE 2:

Database and authentication

PHASE 3:

Student course system

PHASE 4:

Lessons and progress

PHASE 5:

Quiz system

PHASE 6:

Instructor dashboard

PHASE 7:

Admin dashboard

PHASE 8:

AI assistant

PHASE 9:

Recommendations and analytics

PHASE 10:

Certificates

PHASE 11:

Testing and bug fixing

PHASE 12:

Deployment

Do not remove working functionality when adding new features.

====================================================

35. FINAL ACCEPTANCE CRITERIA

====================================================

The project is considered complete only when:

A student can:

Register

↓

Login

↓

Browse courses

↓

Enroll

↓

Open course

↓

Study lessons

↓

Mark lessons complete

↓

See progress update

↓

Take quiz

↓

Receive score

↓

See analytics

↓

Get recommendations

↓

Ask Learno AI

↓

Complete course

↓

Receive certificate

An instructor can:

Login

↓

Create course

↓

Add lessons

↓

Create quiz

↓

View students

↓

View course statistics

An admin can:

Login

↓

View users

↓

View courses

↓

Manage platform data

All important actions must persist in PostgreSQL.

====================================================

36. FINAL INSTRUCTION

====================================================

Build Learno as a genuinely functional full-stack application, not a visual mockup.

Prioritize:

1. Working functionality

2. Real database persistence

3. Authentication/security

4. Clean UX

5. Unique AI features

6. Deployment readiness



Do not add unnecessary features.

Start by creating the project foundation and database/authentication architecture, then continue feature by feature.

Do not wait for me to provide every tiny requirement; make sensible engineering decisions while following the requirements above.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/894ed75e-9b0f-431d-872a-f0840e8314f5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
