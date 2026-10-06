SaaS Project Management Platform
A full-stack project management application I built using React, TypeScript, Node.js, Express, and SQL.
The application allows users to create organizations, manage members, create projects, and manage tasks. I built the project to get hands-on experience with full-stack development, REST APIs, authentication, databases, and building a larger application from frontend to backend.

Status: Actively Developed
Expected Graduation: January 2027 — Rutgers University, B.A. in Computer Science
Features
User registration and login
JWT authentication
Protected API routes
Organizations
Organization members
Organization roles
Projects
Tasks
Task priorities
Task statuses
Due dates
Role-based UI
Backend security checks
Request validation
API error handling
Roles
Each organization can have different types of members:
OWNER
ADMIN
MEMBER
VIEWER
Roles are specific to each organization, so the same user can have different roles in different organizations.
Tech Stack
Frontend
React
TypeScript
React Router
React Hooks
HTML
CSS
Backend
Node.js
Express
TypeScript
REST API
Database
SQL
Other
JWT
Git
GitHub
npm
VS Code
How It Works
The basic structure of the application is:
User
 ↓
Organization
 ↓
Projects
 ↓
Tasks

Projects belong to organizations, and tasks belong to projects.
Users can work with the organizations they are members of and manage projects and tasks based on their role.

Authentication & Security
The application uses JWT authentication for protected API requests.
After logging in, the frontend stores the authentication token and sends it with API requests:

Authorization: Bearer <token>

The backend verifies the token before allowing access to protected endpoints.
Security checks are handled by the backend rather than relying only on the React frontend. This prevents users from bypassing frontend restrictions by manually sending requests to the API.

Projects
Projects belong to an organization.
Users can:

Create projects
View projects
Edit projects
Delete projects
View project details
Project endpoints include:
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

Tasks
Tasks belong to projects and organizations.
Tasks can contain:

Title
Description
Status
Priority
Due date
Assignee
Project
Organization
Task statuses:
TODO
IN_PROGRESS
DONE

Task priorities:
LOW
MEDIUM
HIGH

The task page allows users to create, edit, complete, and delete tasks depending on their permissions.
Tasks can also be grouped by project and sorted by urgency.

API
The backend runs locally on:
http://localhost:5050

The frontend uses:
http://localhost:5050/api

Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Organizations
POST   /api/organizations
GET    /api/organizations
DELETE /api/organizations/:organizationId

Projects
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

Tasks
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

Frontend
The main task management page allows users to:
Select an organization
Select a project
Create tasks
Edit tasks
Complete tasks
Delete tasks
Change task status
Change priority
Set due dates
View tasks grouped by project
Sort tasks by urgency
The frontend communicates with the backend through a centralized API service.
Error Handling
The backend validates incoming requests and returns appropriate HTTP errors when something goes wrong.
Common responses include:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error

Running the Project
Clone the repository:
git clone <your-repository-url>

Install dependencies:
npm install

If the frontend and backend use separate package.json files, install dependencies in both directories.
Create the required environment variables for the database connection and JWT secret.

Start the backend:

npm run dev

Then start the frontend using its development script.
Do not commit .env files, passwords, JWT secrets, or other private credentials to GitHub.
What I Learned
This project helped me become more comfortable building a full-stack application from the frontend to the backend and database.
Some of the main things I worked with were:

React with TypeScript
Express and Node.js
REST API development
JWT authentication
SQL databases
Role-based permissions
Backend security
Request validation
API error handling
Managing API data in React
Connecting frontend applications to backend services
One of the biggest things I learned was how the frontend, backend, and database work together in a larger application.
Future Plans
Some features I may add in the future:
Task comments
Search and filtering
Kanban board
Notifications
User profiles
Email invitations
File attachments
Subtasks
Task dependencies
Audit logs
Pagination
Realtime updates
About Me
I'm a Computer Science student at Rutgers University pursuing a B.A. in Computer Science.
I'm graduating in January 2027, one semester early, and I'm currently looking for software engineering and full-stack opportunities.

Technologies
TypeScript
JavaScript
React
React Router
Node.js
Express
SQL
REST APIs
JWT
Git
GitHub
npm
VS Code