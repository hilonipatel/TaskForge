SaaS Project Management Platform
A full-stack project management application built with React, TypeScript, Node.js, Express, and SQL.
Users can create organizations, manage members, create projects, and manage tasks with different roles and permissions.

Features
User registration and login
JWT authentication
Organizations and members
Role-based permissions
Projects and tasks
Task status, priority, and due dates
Protected API routes
Request validation
Backend security checks
Error handling
Tech Stack
Frontend
React
TypeScript
React Router
React Hooks
Backend
Node.js
Express
TypeScript
REST API
Database & Tools
SQL
JWT
Git
GitHub
npm
VS Code
Roles
Organizations support four roles:
OWNER
ADMIN
MEMBER
VIEWER
Roles are assigned per organization, allowing the same user to have different roles in different organizations.
Application Structure
User
 ↓
Organization
 ↓
Projects
 ↓
Tasks

Projects belong to organizations, and tasks belong to projects.
Authentication & Security
The application uses JWT authentication for protected API requests.
Authorization: Bearer <token>

The backend verifies authentication and permissions before allowing protected operations.
Tasks
Tasks support:
TODO
IN_PROGRESS
DONE
Priorities:
LOW
MEDIUM
HIGH
Users can create, edit, complete, delete, and organize tasks based on their permissions.
API
Backend:
http://localhost:5050

API:
http://localhost:5050/api

Main endpoints:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/organizations
GET    /api/organizations
DELETE /api/organizations/:organizationId

POST   /api/projects
GET    /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id

POST   /api/tasks
GET    /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

What I Learned
This project gave me hands-on experience with:
Full-stack TypeScript development
React frontend development
Node.js and Express APIs
SQL databases
JWT authentication
Role-based permissions
REST API design
Backend security
Request validation
Connecting frontend and backend applications
Future Plans
Task comments
Search and filtering
Kanban board
Notifications
Subtasks
Pagination
Realtime updates
About Me
I'm a Computer Science student at Rutgers University pursuing a B.A. in Computer Science.
I'm graduating in January 2027, one semester early, and I'm currently looking for software engineering and full-stack opportunities.
