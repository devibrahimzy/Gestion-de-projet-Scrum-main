# Installation & Setup Guide

This document outlines the steps required to get the backend server running locally.

## Prerequisites

- **Node.js**: Version 18.x or higher.
- **MySQL**: Version 8.0 or higher (or MariaDB).
- **npm**: Version 9.x or higher.

## Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/imanelujen/Gestion-de-projet-Scrum.git
   cd Gestion-de-projet-Scrumbackend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database Configuration**:
   - Create a database named `ourJira_db`.
   - Import the latest SQL dump (`ourJira_db.sql` in the root).
   - Create a `.env` file in the `backend` folder based on the following template:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=ourJira_db
   JWT_SECRET=your_super_secret_key
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Key Dependencies Installed

- **express**: Web framework.
- **mysql2**: Database driver with promise support.
- **jsonwebtoken (JWT)**: For secure authentication.
- **bcrypt**: Password hashing.
- **uuid**: Unique ID generation for items.
- **dotenv**: Environment variable management.
- **cors**: Cross-Origin Resource Sharing for Frontend integration.
