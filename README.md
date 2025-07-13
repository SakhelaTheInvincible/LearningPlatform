# 🎓 Gradia - AI Learning Platform

A modern, interactive learning platform built with Django REST Framework and Next.js, featuring course management, coding challenges, assessments, and progress tracking.

## 📋 Project Description

This full-stack learning platform provides a comprehensive educational experience with the following features:

- **Course Management**: Create and manage structured courses with weekly content
- **Interactive Coding Challenges**: In-browser code editor with real-time feedback
- **Assessment System**: Multiple choice, true/false, and open-ended questions
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Admin Dashboard**: Course creation, user management, and content upload
- **Responsive Design**: Modern glassmorphism UI that works on all devices
- **User Authentication**: Secure login and registration system

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and enhanced developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and component logic
- **Axios** - HTTP client for API communication

### Backend
- **Django 4.x** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Primary database
- **OpenAI API** - AI-powered features and assistance

### UI/UX Features
- **Glassmorphism Design** - Modern frosted glass effects
- **Responsive Grid Layouts** - Adaptive layouts for all screen sizes
- **Interactive Components** - Smooth animations and transitions
- **Dark Mode Support** - Consistent theming throughout

## 📌 Table of Contents
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

## 🛠 Prerequisites

Before running the project, ensure you have installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/downloads/) (3.8 or higher)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/SakhelaTheInvincible/LearningPlatform.git
cd LearningPlatform
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Or if using yarn
yarn install
```

## 🔧 Environment Setup

### Backend Environment
Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_NAME=learning
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Django Settings
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# OpenAI API (Optional)
OPENAI_API_KEY=your_openai_api_key_here
```

### Database Setup
1. Create a PostgreSQL database named `learning`
2. Update the database credentials in your `.env` file
3. Run migrations:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
python manage.py runserver
```
The backend will be available at `http://localhost:8000`

### Start Frontend Server
```bash
cd frontend
npm run dev
# or
yarn dev
```
The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
LearningPlatform/
├── backend/
│   ├── api/                 # Main API application
│   ├── config/              # Django configuration
│   ├── ai/                  # AI services and integrations
│   ├── file_manager/        # File upload and management
│   └── manage.py           # Django management script
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # Reusable React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout

### Courses
- `GET /api/courses/` - List all courses
- `POST /api/courses/` - Create new course
- `GET /api/courses/{id}/` - Get course details
- `PUT /api/courses/{id}/` - Update course

### Weeks & Tasks
- `GET /api/courses/{id}/weeks/` - Get course weeks
- `GET /api/weeks/{id}/tasks/` - Get week tasks
- `POST /api/tasks/{id}/submit/` - Submit task solution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔧 Troubleshooting

### Common Issues

**Database Connection Error:**
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify database exists and is accessible

**Frontend Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

**Backend Import Errors:**
- Ensure virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt`

**Port Already in Use:**
- Backend: Change port with `python manage.py runserver 8001`
- Frontend: Change port with `npm run dev -- -p 3001`