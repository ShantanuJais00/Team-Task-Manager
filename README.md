# Team Task Manager

A comprehensive project management and task tracking application designed for teams to collaborate efficiently. This platform provides a centralized environment for creating projects, managing tasks through a Kanban-style interface, and maintaining role-based access control.

## Project Overview

The Team Task Manager is built to solve the complexities of modern team collaboration. It allows administrators to oversee multiple projects, while team members can focus on their assigned responsibilities. The application emphasizes clarity and control, ensuring that progress is transparent and deadlines are manageable.

## Key Features

- **Authentication and Authorization**: Secure login and registration system with role-based access control (Admin and Member roles).
- **Project Management**: Administrators can create, describe, and assign members to specific projects.
- **Task Tracking**: Tasks are organized within projects and can be moved across status columns (To Do, In Progress, Done).
- **Dashboard Overview**: A personalized dashboard for each user, displaying project statistics, recent activities, and pending tasks.
- **Responsive Design**: A modern, premium interface that adapts seamlessly to different screen sizes and supports both light and dark themes.

## Technology Stack

### Frontend
- **React with TypeScript**: For a robust and type-safe user interface.
- **Vite**: A high-performance build tool for modern web development.
- **Tailwind CSS**: A utility-first CSS framework for custom, premium styling.
- **Shadcn UI**: A collection of reusable components built with Radix UI primitives.
- **React Router**: For seamless navigation and layout management.

### Backend
- **Node.js and Express**: Providing a scalable and efficient REST API.
- **MongoDB and Mongoose**: A flexible NoSQL database for managing complex data relationships.
- **JSON Web Tokens (JWT)**: For secure, stateless authentication.
- **Bcrypt.js**: For secure password hashing and protection.

## Getting Started

### Prerequisites
- Node.js (v16.0 or higher)
- MongoDB (Local or Atlas instance)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Team-Task-Manager
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file and configure your environment variables:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```

3. **Frontend Setup**:
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

## Configuration and Usage

Once both servers are running, access the application at `http://localhost:5173`. 

- **Registration**: New users can sign up as either an Admin or a Member.
- **Admin Capabilities**: Admins can create new projects and assign existing members to them.
- **Member Capabilities**: Members can view projects they belong to and manage the status of tasks assigned to them or within their projects.

## Project Structure

The project follows a monorepo-style structure for ease of development:
- `/backend`: Contains the Express API, Mongoose models, and authentication logic.
- `/frontend`: Contains the React application, styling tokens, and UI components.
