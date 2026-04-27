# Student Peer Review & Collaboration Platform

Presentation content for:

- Course: `24SDCS02E - FSAD`
- Use Case: `FSAD-SDP-26`
- Team: `24SDCS02E-S04-SDP-18`

---

## Slide 1: Title Slide

**Student Peer Review & Collaboration Platform**

- Full Stack Application for Academic Project Review
- Team Name: `24SDCS02E-S04-SDP-18`
- Course: `24SDCS02E - FSAD`
- Academic Year / Semester: `2025-26 / Semester`

**Presenter Note**
- Introduce the team and state that the project is a role-based peer review platform for students, teachers, and admin users.

---

## Slide 2: Problem Statement

**Problem**

- Managing student project reviews manually is slow and unstructured
- Peer feedback is often inconsistent and difficult to track
- Teachers need a centralized system to monitor progress and approvals
- Admin needs visibility over users, activity, and overall platform usage

**Solution**

- A web-based platform for submission, peer review, teacher evaluation, and admin monitoring

---

## Slide 3: Objectives

**Project Objectives**

- Enable students to upload projects and participate in peer review
- Allow teachers to assign reviewers, monitor submissions, and grade projects
- Provide admin-level platform visibility
- Maintain role-based access with separate dashboards
- Support online deployment for real-world usability

---

## Slide 4: System Users

**User Roles**

- **Student**
  - Register and login
  - Upload projects
  - Submit peer reviews
  - View dashboard and activity

- **Teacher**
  - View all projects
  - Assign reviewers
  - Review progress
  - Approve, reject, or request improvement

- **Admin**
  - View all users
  - Monitor activity
  - Access project and review overview
  - Export platform data

---

## Slide 5: Technology Stack

**Frontend**

- React
- Vite
- React Router
- Tailwind CSS
- Recharts

**Backend**

- Spring Boot
- Spring Web
- Spring Data JPA
- Maven

**Database**

- PostgreSQL on Render

**Deployment**

- Frontend: Vercel
- Backend: Render

---

## Slide 6: Architecture

**Architecture Flow**

`Frontend (React + Vercel)`  
`-> API Calls`  
`Backend (Spring Boot + Render)`  
`-> Database Access`  
`PostgreSQL Database (Render)`

**Key Points**

- Frontend consumes REST APIs
- Backend handles authentication, CRUD, and business logic
- Database stores users, projects, reviews, assignments, and activity data

---

## Slide 7: Core Modules

**Implemented Modules**

- Authentication module
- Student dashboard
- Teacher dashboard
- Admin dashboard
- Project upload and tracking
- Peer review module
- Reviewer assignment
- Teacher approvals and grading
- Activity timeline and reporting
- Export features

---

## Slide 8: Routing and UI

**Routing**

- Role-based routing implemented
- Protected routes for student, teacher, and admin
- Separate dashboards and pages for each module

**UI Highlights**

- Responsive layout
- Dashboard-based workflow
- Clean role-wise navigation
- Charts, tables, cards, and summaries

**Rubric Relevance**

- Covers routing + UI/UX expectations

---

## Slide 9: Validation and Error Handling

**Frontend Validation**

- Required field validation
- Email/password checks
- Captcha validation in login/register flow
- Clear success and error messages

**Backend Validation**

- Request validation using Spring validation
- Conflict handling for duplicate registration
- Exception handling for invalid requests

**Rubric Relevance**

- Covers validation and exception handling

---

## Slide 10: API Integration and CRUD

**API Integration**

- Reusable frontend service calls
- Login/register integration
- Project data fetch and update
- Review and approval workflows

**CRUD Operations**

- Create: register, upload project, create review
- Read: dashboards, projects, users, activity
- Update: approvals, assignment decisions, progress
- Delete: based on available module logic if required by workflow

**Rubric Relevance**

- Covers Fetch/API usage + CRUD + backend integration

---

## Slide 11: Authentication and Session Management

**Authentication**

- Role-based login/register system
- Admin, teacher, and student portal separation

**Session Management**

- User session maintained using browser storage
- Protected routes based on current user role

**Note**

- Current implementation is suitable for academic demonstration and functional review

---

## Slide 12: Deployment

**Live Deployment**

- Frontend: [https://peer-review-app-nine.vercel.app](https://peer-review-app-nine.vercel.app)
- Backend: [https://peer-review-backend-new.onrender.com](https://peer-review-backend-new.onrender.com)
- GitHub: [https://github.com/Reddy1236/Full-Stack-Project](https://github.com/Reddy1236/Full-Stack-Project)

**Deployment Outcome**

- Frontend hosted successfully on Vercel
- Backend hosted successfully on Render
- Database connected on Render PostgreSQL

---

## Slide 13: GitHub and Team Work

**Repository**

- Public GitHub repository maintained
- Source code pushed with commits
- Frontend and backend managed in one repo

**Team Contribution**

- Team collaboration used for frontend, backend, deployment, and testing

**Rubric Relevance**

- Covers Git usage and team coordination discussion

---

## Slide 14: Challenges Faced

**Challenges**

- Handling deployment for frontend and backend separately
- Reconfiguring backend after database expiry
- Connecting Render PostgreSQL with Spring Boot
- Fixing Docker packaging and deployment issues
- Managing environment variables across Vercel and Render

**How We Solved Them**

- Updated deployment settings
- Created a new database
- Reconfigured backend environment variables
- Verified live links and end-to-end flow

---

## Slide 15: Future Enhancements

**Future Scope**

- JWT-based authentication
- Password encryption
- Email notifications
- File storage improvements
- Advanced analytics dashboard
- Persistent export/reporting improvements
- Better audit trail and admin controls

---

## Slide 16: Conclusion

**Conclusion**

- Successfully developed and deployed a full-stack peer review platform
- Implemented role-based workflows for student, teacher, and admin
- Achieved API integration, CRUD functionality, routing, validation, and deployment
- Project meets the main goals of the FSAD SDP use case

**Thank You**

- Questions and feedback

---

## Short Demo Flow

Use this order during presentation demo:

1. Open deployed frontend
2. Show login/register page
3. Login as student and show dashboard
4. Show upload/review/activity sections
5. Login as teacher and show project review and approvals
6. Login as admin and show monitoring/export features
7. Show GitHub repository
8. Show deployment links

