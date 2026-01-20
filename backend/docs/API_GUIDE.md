# OurScrum - Ultra-Detailed API Guide for Frontend Engineers

This guide provides a comprehensive reference for all available API endpoints. It is designed to help you integrate the frontend efficiently and troubleshoot issues with real-world examples.

## 🔑 Authentication & Authorization

All routes (except Login/Register) require a **JSON Web Token (JWT)**.

- **Base URL**: `http://localhost:5000/api`
- **Header**: `Authorization: Bearer <your_token>`

---

## 🛠️ Modules Reference

### 1. 📂 Projects & Members
Manage project creation and team composition.

| Method | Endpoint | Description | Optimization Tip |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects` | Get all active projects. | Cache this list on the frontend. |
| `POST` | `/projects` | Create a new project. | Validate dates on the frontend first. |
| `GET` | `/projects/:id` | Get project details. | - |
| `GET` | `/projects/:id/members` | List members and their roles. | Use this for assignee dropdowns. |
| `POST` | `/projects/members` | Add a user to a project. | Verify user exists before calling. |

**Real-world Example (Test project):**
`GET /api/projects/ea4b036b-875e-4c29-b6f3-3101aba560c4`

---

### 2. 📋 Backlog & Sprints
Handling requirements and agile iterations.

| Method | Endpoint | Description | Response Example (Success) |
| :--- | :--- | :--- | :--- |
| `GET` | `/backlog?projectId=...` | Fetch project backlog. | `[{ id, title, priority, ... }]` |
| `POST` | `/backlog` | Create story/bug. | Returns the created object with UUID. |
| `PATCH` | `/backlog/:id/assign` | Assign user to item. | `{"message": "Member assigned"}` |
| `POST` | `/sprints` | Create a new sprint. | Sprint starts as `PLANNING`. |
| `PATCH` | `/sprints/:id/activate` | Start the sprint. | Moves items to `TODO`. |
| `PATCH` | `/sprints/:id/complete` | End sprint. | Calculates velocity automatically. |

**Optimization**: Use the `projectId` filter to only fetch what's visible.

---

### 3. 🏗️ Kanban Board (Complex Logic)
Dynamic reordering and state management.

| Method | Endpoint | Description | Required Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/kanban/:sprintId` | Get board items. | Query params: `assigned_to_id`, `type`. |
| `PATCH` | `/kanban/move/:id` | **Drag & Drop Logic**. | `{"toStatus": "DONE", "toPosition": 1}` |

**💡 Optimization**: The `move` endpoint automatically tracks `started_at` when moving to `IN_PROGRESS` and `completed_at` when moving to `DONE`. No extra calls needed!

---

### 4. 📈 Dashboard & Analytics
Real-time KPI calculation.

- `GET /api/dashboard/:projectId/summary`: Global stats (Total Points, Workload).
- `GET /api/dashboard/:projectId/velocity`: Chart-ready data (History of last 5 sprints).
- `GET /api/dashboard/:projectId/agile`: Lead Time vs Cycle Time average.

---

### 💬 Comments System
- `GET /api/comments/:backlogItemId`: List all comments for a specific task.
- `POST /api/comments`: `{"backlog_item_id": "...", "content": "..."}`.

---

## 🧪 Troubleshooting & Test Data

Use these IDs from our current database for your Postman tests:

- **Project (CAF)**: `ea4b036b-875e-4c29-b6f3-3101aba560c4`
- **Sprint (Sprint 3)**: `71aee8a6-61d1-46bf-b08a-bd88dfae1684`
- **Scrum Master (Imano)**: `75b246fb-cd4c-45bc-8ff1-6d6d4c65894c`
- **Team Member (Bono)**: `146fae23-ddf1-4a3f-a39f-d8f525602964`

### Common Errors:
- `403 Unauthorized`: You are trying to access a project/sprint where you aren't registered in `project_members`.
- `400 Bad Request`: Missing mandatory fields (Title, Project ID, etc.).
- `500 Server Error`: Usually a database constraint violation or malformed UUID.

## 🚀 Optimization Recipes for Frontend
1. **Debouncing Position Updates**: When moving cards fast in Kanban, debounce the `PATCH` call to avoid DB locks.
2. **Optimistic UI**: Update the card position locally before the server responds for a "premium" feel.
3. **Lazy Loading Comments**: Only fetch comments when the item detail modal is opened.
