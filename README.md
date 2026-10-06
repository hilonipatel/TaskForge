# SaaS Project Management Platform

A full-stack project management application built with React, TypeScript, Node.js, Express, and SQL.

Users can create organizations, manage members, create projects, and manage tasks with different roles and permissions.

About Me
I'm a Computer Science student at Rutgers University pursuing a B.A. in Computer Science.
I'm graduating in January 2027, one semester early, and I'm currently looking for software engineering and full-stack opportunities.

## Features

- User registration and login
- JWT authentication
- Organizations and members
- Role-based permissions
- Projects and tasks
- Task status, priority, and due dates
- Protected API routes
- Request validation
- Backend security checks
- Error handling

## Tech Stack

### Frontend

- React
- TypeScript
- React Router
- React Hooks
- HTML
- CSS

### Backend

- Node.js
- Express
- TypeScript
- REST API

### Database & Tools

- SQL
- JWT
- Git
- GitHub
- npm
- VS Code

## Roles

Organizations support four roles:

- OWNER
- ADMIN
- MEMBER
- VIEWER

Roles are assigned per organization, so the same user can have different roles in different organizations.

## Application Structure

```text
User
  ↓
Organization
  ↓
Projects
  ↓
Tasks
