# OurScrum - Collaborative Agile Management Tool

OurScrum is a modern, high-performance project management platform built for Scrum teams. It streamlines the development process with a robust backlog, an interactive Kanban board, and detailed analytics.

## 🚀 Key Features

- **Backlog Management**: Prioritize stories, estimate effort, and assign tasks.
- **Sprint Lifecycle**: Plan, activate, and complete sprints with automatic velocity tracking.
- **Interactive Kanban**: Seamlessly move tasks across columns with precise positioning.
- **Agile Analytics**: Track team performance with Velocity charts, Lead Time, and Cycle Time.
- **Retrospectives**: Team feedback system with voting and action item tracking.

## 🛠️ Tech Stack

### Backend
- **Core**: Node.js & Express.
- **Database**: MySQL (optimized with indexed queries and transactions).
- **Security**: JWT Authentication & Bcrypt hashing.
- **Documentation**: Detailed API guides for seamless frontend integration.

### Frontend (Upcoming)
- **Framework**: React + Vite (TypeScript).
- **Styling**: Tailwind CSS & Modern Glassmorphism design.
- **State Management**: Zustand / Redux.
- **Interaction**: `@dnd-kit/core` for high-performance Drag & Drop.

## 📖 Documentation

Detailed documentation can be found in the `backend/docs` folder:
- [Installation & Setup](backend/docs/INSTALLATION.md)
- [Frontend API Guide](backend/docs/API_GUIDE.md)

## 🛠️ Quick Start

1. **Database**: Import `ourJira_db.sql` into your MySQL server.
2. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env # Configure your DB credentials
   npm start
   ```
3. **Frontend**:
   ```bash
   # Coming soon
   ```

---
*Built with ❤️ for Agile Teams.*
