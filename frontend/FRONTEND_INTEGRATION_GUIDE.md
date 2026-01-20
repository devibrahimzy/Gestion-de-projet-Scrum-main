# Frontend Integration Guide for OurScrum Backend

## Overview of Backend Architecture

The OurScrum backend is a Node.js/Express REST API designed for agile project management using Scrum methodology. It provides comprehensive endpoints for managing projects, sprints, backlog items, user authentication, and team collaboration features.

### Technology Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5.2.1)
- **Database**: MySQL (v8.0+) with connection pooling
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Security**: CORS enabled, input validation
- **Unique IDs**: UUID v4 for all entities

### Key Features
- User management with role-based access (ADMIN, PRODUCT_OWNER, SCRUM_MASTER, TEAM_MEMBER)
- Project management with member roles
- Sprint planning and execution
- Kanban-style backlog management with drag-and-drop support
- Retrospective meetings with voting system
- Dashboard analytics and reporting
- Comment system for backlog items

### Database Schema Overview
The system uses 8 main tables with proper foreign key relationships:
- `users`: User accounts and roles
- `projects`: Project definitions with status tracking
- `project_members`: Many-to-many relationship between users and projects with roles
- `sprints`: Time-boxed development iterations
- `backlog_items`: User stories, bugs, and tasks with priority and status
- `backlog_item_comments`: Discussion threads on backlog items
- `retrospectives`: Sprint review meetings
- `retro_items`: Retrospective feedback items with voting

## Authentication and Authorization

### Authentication Flow
All API endpoints except registration and login require JWT authentication.

**Base URL**: `http://localhost:5000/api` (configurable via PORT env var)

**Authentication Header**:
```
Authorization: Bearer <your_jwt_token>
```

### User Roles and Permissions
- **ADMIN**: Full system access, user management
- **PRODUCT_OWNER**: Project oversight, backlog prioritization
- **SCRUM_MASTER**: Sprint management, team coordination
- **TEAM_MEMBER**: Task execution, limited project management

### Login Process
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "role": "TEAM_MEMBER"
  }
}
```

### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "role": "TEAM_MEMBER"
}
```

**Response**: `{"message": "User created"}` (201 status)

### Password Reset Flow
1. Request reset: `POST /api/auth/forgot-password` with email
2. Reset password: `POST /api/auth/reset-password` with token and new password

## Complete API Endpoints Reference

### Authentication Routes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/register` | Create new user account | `{email, password, first_name, last_name, role}` | `{"message": "User created"}` |
| POST | `/auth/login` | Authenticate user | `{email, password}` | `{token, user: {id, email, role}}` |
| GET | `/auth/profile` | Get current user profile | - | User object |
| POST | `/auth/logout` | Logout user | - | `{"message": "Logged out successfully"}` |
| POST | `/auth/forgot-password` | Request password reset | `{email}` | `{"message": "Reset token generated", "token": "..."}` |
| POST | `/auth/reset-password` | Reset password with token | `{token, newPassword}` | `{"message": "Password reset successfully"}` |
| POST | `/auth/create-admin` | Create admin user (dev only) | `{email, password, first_name, last_name}` | Admin user created |

### User Management (Admin Only)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/users` | Get all users (with optional search) | Query: `?search=term` | Array of user objects |
| GET | `/users/:id` | Get user by ID | - | User object |
| PUT | `/users/:id` | Update user | `{first_name, last_name, role}` | `{"message": "User updated successfully"}` |
| DELETE | `/users/:id` | Soft delete user | - | `{"message": "User disabled successfully"}` |

### Project Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/projects/my-projects` | Get user's projects | - | Array of projects with user's role |
| GET | `/projects` | Get all active projects | - | Array of project objects |
| POST | `/projects` | Create new project | `{name, description, start_date, end_date}` | Created project object |
| GET | `/projects/:id` | Get project details | - | Project object |
| PUT | `/projects/:id` | Update project (Scrum Master only) | `{name, description, start_date, end_date, status}` | Updated project |
| DELETE | `/projects/:id` | Soft delete project (Scrum Master only) | - | `{"message": "Project soft-deleted successfully"}` |
| GET | `/projects/:id/members` | Get project members | - | Array of `{role, id, first_name, last_name, email}` |
| POST | `/projects/members` | Add member to project (Scrum Master only) | `{project_id, user_id, role}` | Member object |
| DELETE | `/projects/:id/members/:userId` | Remove member (Scrum Master only) | - | `{"message": "Member removed"}` |

### Sprint Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/sprints?projectId=uuid` | Get sprints for project | Query param: projectId | Array of sprint objects |
| POST | `/sprints` | Create new sprint (Scrum Master only) | `{project_id, name, start_date, end_date, planned_velocity}` | Created sprint object |
| PUT | `/sprints/:id` | Update sprint | Partial sprint data | `{"message": "Sprint updated successfully"}` |
| DELETE | `/sprints/:id` | Soft delete sprint (Scrum Master only) | - | `{"message": "Sprint soft-deleted successfully"}` |
| PUT | `/sprints/:id/activate` | Activate sprint (Scrum Master only) | - | `{"message": "Sprint activated successfully"}` |
| PUT | `/sprints/:id/complete` | Complete sprint (auto-calculates velocity) | - | `{message, actual_velocity}` |

### Backlog Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/backlog?projectId=uuid` | Get project backlog | Query param: projectId | Array of backlog items |
| GET | `/backlog/:id` | Get backlog item details | - | Backlog item object |
| GET | `/backlog/sprint/:sprintId` | Get sprint backlog items | - | Array of sprint items |
| POST | `/backlog` | Create backlog item | `{project_id, sprint_id?, title, description?, type?, story_points?, priority?, assigned_to_id?}` | Created item object |
| PUT | `/backlog/:id` | Update backlog item | Partial item data | `{"message": "Item updated successfully"}` |
| PATCH | `/backlog/:id/assign` | Assign/unassign member | `{userId}` | `{message, assigned_to_id}` |
| DELETE | `/backlog/:id` | Soft delete item | - | `{"message": "Item deleted successfully"}` |

### Kanban Board

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/kanban/:sprintId` | Get kanban board items | Query: `?assigned_to_id=uuid&type=USER_STORY` | Array of kanban items |
| PATCH | `/kanban/move/:id` | Move item (drag & drop) | `{toStatus, toPosition, toSprintId?}` | `{message, item}` |

### Comments System

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/comments/:itemId` | Get comments for backlog item | - | Array of comments with user info |
| POST | `/comments` | Add comment to item | `{backlog_item_id, content}` | Created comment object |
| DELETE | `/comments/:id` | Soft delete comment | - | `{"message": "Comment deleted"}` |

### Dashboard Analytics

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/dashboard/:projectId/summary` | Main metrics dashboard | `{summary, workload, velocity, agile, sprints}` |
| GET | `/dashboard/:projectId/velocity` | Velocity history chart data | Array of `{name, planned_velocity, actual_velocity}` |
| GET | `/dashboard/:projectId/agile` | Agile performance metrics | `{avg_lead_time_hours, avg_cycle_time_hours}` |

### Retrospective Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/retrospectives/sprint/:sprintId` | Get sprint retrospective | - | Retrospective object with items |
| POST | `/retrospectives` | Create retrospective | `{sprint_id, date, facilitator_id?}` | Created retro object |
| PATCH | `/retrospectives/:id/publish` | Publish retrospective | - | `{message, status}` |
| GET | `/retrospectives/project/:projectId` | Get project retrospectives | - | Array of retrospectives |
| GET | `/retrospectives/project/:projectId/trends` | Get retrospective trends | - | Array of `{category, count}` |
| POST | `/retrospectives/items` | Add retro item | `{retrospective_id, category, text}` | Created item |
| POST | `/retrospectives/items/:id/vote` | Vote on retro item | - | `{"message": "Vote recorded"}` |
| PATCH | `/retrospectives/items/:id/status` | Update action item status | `{is_completed}` | Status update confirmation |
| DELETE | `/retrospectives/items/:id` | Delete retro item | - | `{"message": "Item deleted"}` |

## Database Models and Relationships

### Core Entities

#### User Model
```javascript
{
  id: "uuid",
  email: "string",
  password: "hashed_string",
  first_name: "string",
  last_name: "string",
  role: "ADMIN|PRODUCT_OWNER|SCRUM_MASTER|TEAM_MEMBER",
  created_at: "timestamp",
  updated_at: "timestamp",
  isActive: true,
  lastLogin: "datetime",
  resetToken: "string",
  resetTokenExpires: "datetime"
}
```

#### Project Model
```javascript
{
  id: "uuid",
  name: "string",
  description: "text",
  start_date: "date",
  end_date: "date",
  status: "PLANNING|ACTIVE|COMPLETED",
  created_at: "timestamp",
  updated_at: "timestamp",
  isActive: true,
  created_by: "uuid" // references users.id
}
```

#### Project Members (Junction Table)
```javascript
{
  id: "uuid",
  project_id: "uuid", // references projects.id
  user_id: "uuid", // references users.id
  role: "PRODUCT_OWNER|SCRUM_MASTER|TEAM_MEMBER",
  joined_at: "timestamp"
}
```

#### Sprint Model
```javascript
{
  id: "uuid",
  project_id: "uuid", // references projects.id
  name: "string",
  start_date: "date",
  end_date: "date",
  status: "PLANNING|ACTIVE|COMPLETED",
  planned_velocity: 0,
  actual_velocity: 0,
  created_at: "timestamp",
  updated_at: "timestamp",
  isActive: true
}
```

#### Backlog Item Model
```javascript
{
  id: "uuid",
  project_id: "uuid", // references projects.id
  sprint_id: "uuid", // references sprints.id (nullable)
  title: "string",
  description: "text",
  type: "USER_STORY|BUG|TASK|SPIKE",
  story_points: 0,
  priority: 0,
  status: "BACKLOG|TODO|IN_PROGRESS|DONE",
  position: 0,
  assigned_to_id: "uuid", // references users.id (nullable)
  created_by_id: "uuid", // references users.id
  created_at: "timestamp",
  updated_at: "timestamp",
  isActive: true,
  started_at: "timestamp", // nullable
  completed_at: "timestamp" // nullable
}
```

#### Comment Model
```javascript
{
  id: "uuid",
  backlog_item_id: "uuid", // references backlog_items.id
  user_id: "uuid", // references users.id
  content: "text",
  created_at: "timestamp",
  isActive: true
}
```

#### Retrospective Model
```javascript
{
  id: "uuid",
  sprint_id: "uuid", // references sprints.id
  date: "date",
  status: "DRAFT|PUBLISHED",
  facilitator_id: "uuid", // references users.id
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

#### Retro Item Model
```javascript
{
  id: "uuid",
  retrospective_id: "uuid", // references retrospectives.id
  category: "POSITIVE|IMPROVE|ACTION",
  text: "text",
  votes: 0,
  author_id: "uuid", // references users.id
  created_at: "timestamp",
  is_completed: false
}
```

### Key Relationships
- **Users** ↔ **Projects**: Many-to-many via project_members
- **Projects** → **Sprints**: One-to-many
- **Projects** → **Backlog Items**: One-to-many
- **Sprints** → **Backlog Items**: One-to-many
- **Users** → **Backlog Items**: One-to-many (assigned_to, created_by)
- **Backlog Items** → **Comments**: One-to-many
- **Sprints** → **Retrospectives**: One-to-one
- **Retrospectives** → **Retro Items**: One-to-many

## Error Handling and Common Error Codes

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (missing required fields)
- **401**: Unauthorized (missing/invalid JWT)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

### Common Error Responses

#### Authentication Errors
```json
{
  "message": "Unauthorized"
}
```

#### Permission Errors
```json
{
  "message": "Only Scrum Master can update project"
}
```

#### Validation Errors
```json
{
  "message": "Project name is required"
}
```

#### Business Logic Errors
```json
{
  "message": "Cannot move items from a completed sprint"
}
```

#### Database Constraint Errors
```json
{
  "message": "Error creating project",
  "error": "Foreign key constraint fails"
}
```

### Error Handling Best Practices
1. Always check for `401` and redirect to login
2. Handle `403` by showing appropriate UI messages
3. Validate inputs on frontend to prevent `400` errors
4. Implement retry logic for `500` errors
5. Log errors for debugging but don't expose sensitive info

## Best Practices and Tips for Frontend Integration

### 1. Authentication Management
- Store JWT token securely (localStorage with httpOnly cookies if possible)
- Implement token refresh logic (though current tokens expire in 1 day)
- Handle token expiration gracefully with automatic logout
- Include Authorization header in all authenticated requests

### 2. State Management
- Cache user projects and members to reduce API calls
- Implement optimistic updates for better UX (e.g., kanban drag & drop)
- Use proper loading states for async operations
- Handle offline scenarios where possible

### 3. API Optimization
- Use query parameters for filtering (e.g., `?projectId=uuid`)
- Implement pagination for large datasets (future enhancement)
- Debounce rapid operations like search or drag & drop
- Cache static data like project members and user roles

### 4. Real-time Features
- Consider WebSocket integration for live kanban updates (future enhancement)
- Poll dashboard data periodically for analytics
- Implement push notifications for sprint deadlines

### 5. Form Validation
- Validate required fields before API calls
- Use proper input types (dates, numbers) for better UX
- Show clear error messages from API responses
- Implement client-side validation to match server rules

### 6. Kanban Board Implementation
- Use the `move` endpoint for all drag operations
- Handle position reordering automatically via API
- Track `started_at` and `completed_at` timestamps
- Prevent moves to completed sprints

### 7. Role-Based UI
- Hide/show UI elements based on user roles
- Validate permissions on both frontend and backend
- Show different views for Scrum Masters vs Team Members

### 8. Error Handling Patterns
```javascript
// Example error handling in frontend
try {
  const response = await api.post('/projects', projectData);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 403) {
    // Show permission error
  } else {
    // Show generic error
  }
}
```

### 9. Data Synchronization
- Use consistent date formats (ISO 8601)
- Handle timezone differences appropriately
- Sync local state with server responses
- Implement conflict resolution for concurrent edits

### 10. Performance Tips
- Lazy load comments and retrospective data
- Use virtual scrolling for large backlogs
- Implement search and filtering on frontend where possible
- Minimize API calls by batching operations

## Setup and Configuration

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm 9+

### Environment Configuration
Create a `.env` file in the backend root:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ourJira_db
JWT_SECRET=your_super_secret_key_here
```

### Database Setup
1. Create database: `CREATE DATABASE ourJira_db;`
2. Import schema: Run the `ourJira_db1.sql` dump file
3. Verify tables are created with proper relationships

### Installation Steps
```bash
cd backend
npm install
npm run dev  # For development with nodemon
# or
npm start    # For production
```

### Testing the API
Use the following test IDs from the sample data:
- **Project**: `ea4b036b-875e-4c29-b6f3-3101aba560c4` (CAF)
- **Sprint**: `71aee8a6-61d1-46bf-b08a-bd88dfae1684` (Sprint 3)
- **User**: `75b246fb-cd4c-45bc-8ff1-6d6d4c65894c` (Scrum Master)

### Troubleshooting
- Check database connection in logs
- Verify JWT secret matches between requests
- Ensure user is member of project before operations
- Check role permissions for restricted endpoints

This guide provides everything needed to successfully integrate with the OurScrum backend. For additional support, refer to the API_GUIDE.md or contact the development team.