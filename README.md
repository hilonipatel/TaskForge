SaaS Project Management Platform
A full-stack project management application I built using React, TypeScript, Node.js, Express, and SQL.
The goal of the project was to build something similar to a small SaaS project management platform where users can create organizations, manage members, create projects, and manage tasks.

The project also gave me experience working with authentication, role-based permissions, REST APIs, database access, and organizing a backend into separate layers.

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
Backend authorization
Request validation
API error handling
Roles
Each organization has its own members and roles.
The current roles are:

OWNER
ADMIN
MEMBER
VIEWER
Roles are tied to the organization membership rather than the user globally.
For example, a user could be an OWNER in one organization and a MEMBER in another.

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
Membership / Role
 ↓
Project
 ↓
Task

Projects belong to organizations, and tasks belong to projects.
This means users should only be able to access projects and tasks that belong to organizations they have access to.

Authentication
The application uses JWTs for authentication.
After logging in, the frontend stores the token and sends it with authenticated API requests:

Authorization: Bearer <token>

The backend verifies the token and attaches the authenticated user's ID to the request.
There are currently three main authentication endpoints:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

Role-Based Access Control
One of the main parts of the project was making sure permissions are handled on the backend instead of only hiding buttons in React.
For example, a VIEWER might not see a "Create Task" button, but that alone isn't enough.

If they manually send:

POST /api/tasks

the backend still checks their organization membership and role before allowing the request.
The general authorization flow is:

Authenticated user
       ↓
Organization membership
       ↓
User's role
       ↓
Permission check
       ↓
Allow or reject request

This was an important part of the project because it helped me understand the difference between frontend permissions and actual API security.
Projects
Projects belong to an organization.
Available project operations include:

POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

Projects currently contain information such as:
Project name
Description
Organization ID
Tasks
Tasks belong to both a project and an organization.
A task can contain:

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
Tasks are also grouped by project and sorted so that unfinished and more urgent tasks appear first.

Backend Structure
I organized the backend into separate layers instead of putting database and business logic directly inside the route handlers.
The structure is roughly:

server/src/

├── middleware/
├── repositories/
├── routes/
├── services/
├── types/
├── utils/
├── validation/
└── errors/

The main flow is:
Route
 ↓
Authentication
 ↓
Validation
 ↓
Service
 ↓
Repository
 ↓
Database

Routes
Routes handle the HTTP requests and responses.
Examples:

authRoutes.ts
organizationRoutes.ts
projectRoutes.ts
taskRoutes.ts

Middleware
Authentication middleware verifies JWTs and identifies the current user.
Validation
Request data is validated before reaching the service layer.
Examples:

authValidation.ts
organizationValidation.ts
projectValidation.ts
taskValidation.ts

Services
The service layer contains the main application logic and authorization checks.
Examples:

authService.ts
organizationService.ts
organizationMemberService.ts
projectService.ts
taskService.ts

Repositories
Repositories handle database operations so database queries aren't mixed into the route handlers.
Frontend API Service
Frontend API calls are kept in:
src/services/api.ts

This file contains functions for things like:
loginUser()
registerUser()

getOrganizations()
createOrganization()
deleteOrganization()

getOrganizationMembers()
addOrganizationMember()
removeOrganizationMember()
updateOrganizationMemberRole()

getProjects()
createProject()
updateProject()
deleteProject()

getTasks()
createTask()
updateTask()
deleteTask()

This keeps the React components from having to handle the API requests directly.
Error Handling
The backend uses an AppError class for expected application errors.
The API can return errors such as:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error

The frontend checks the response and displays the returned error when appropriate.
API
The backend runs locally on:
http://localhost:5050

The frontend uses:
http://localhost:5050/api

Running the Project
Clone the repository:
git clone <your-repository-url>

Install dependencies:
npm install

If the frontend and backend have separate package.json files, install dependencies in both directories.
Create the required environment variables for the backend, including the database connection and JWT secret.

Start the backend using the project's development script:

npm run dev

Then start the frontend using its development script.
Do not commit .env files, database passwords, JWT secrets, or other private credentials to GitHub.
Project Structure
The overall project is organized roughly like this:
project/

├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── ...
│
├── server/
│   └── src/
│       ├── middleware/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── validation/
│       └── ...
│
└── README.md

What I Learned
This project helped me get more comfortable with building a full-stack application from the frontend all the way to the database.
Some of the main things I worked with were:

React with TypeScript
Building REST APIs with Express
JWT authentication
Role-based access control
SQL and database operations
Backend authorization
Request validation
Service and repository patterns
Managing API state in React
Handling errors between the frontend and backend
Structuring a larger TypeScript project
One of the biggest things I learned was that frontend restrictions aren't enough for security. The backend needs to verify the user, organization, and role for every protected operation.
Future Plans
Some features I may add as the project continues:
Task comments
Task activity/history
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
I'm graduating in January 2027, one semester early, and I'm currently looking for software engineering and full-stack opportunities where I can continue building my skills and work on real-world software.

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
RBAC
Git
GitHub
npm
VS Code