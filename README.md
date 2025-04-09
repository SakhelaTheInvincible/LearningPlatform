# Fullstack Application with Django and Next.js

A modern fullstack application with Django REST Framework backend and Next.js (TypeScript) frontend.

## 📌 Table of Contents
- [Prerequisites](#-prerequisites)
- [Setup](#-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)

## 🛠 Prerequisites

Before running the project, ensure you have installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/downloads/) (3.8 or higher)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/downloads)

## 🚀 Setup

copy the `.env.example` file to `.env` and fill in the required environment variables.

### Running The Code
```bash
git clone https://github.com/SakhelaTheInvincible/LearningPlatform.git

# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install django djangorestframework psycopg2-binary python-dotenv django-cors-headers openai
```

### Set up database (ensure PostgreSQL is running)
Edit backend/settings.py with your DB credentials and ensure that database name is "learning"

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional for admin access)
python manage.py createsuperuser

# Run Server
python manage.py runserver

# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Or if using yarn
yarn install

# Run Server
npm run dev
# or
yarn dev
```
